"""
BanNano — Actualización Simple del Modelo (sin cambios de arquitectura)
=======================================================================
Este script reentrena el mismo modelo EfficientNetV2-S con más épocas,
mejor data augmentation, y posiblemente más datos. La arquitectura es exactamente
la misma, así que el backend NO necesita cambios.

Uso:
    python scripts/retrain_model.py --dataset /path/to/dataset --output ./model_new

Requisitos:
    pip install tensorflow>=2.18 scikit-learn numpy pillow matplotlib
"""

import argparse
import os
import json
import random
import warnings
from pathlib import Path
from collections import defaultdict

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight

warnings.filterwarnings('ignore')
tf.get_logger().setLevel('ERROR')

SEED = 42
random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)

# ── Configuración ────────────────────────────────────────────────────────────
IMG_SIZE = 224
BATCH_SIZE = 32
HEAD_EPOCHS = 25   # Más épocas que antes (20)
FINE_EPOCHS = 50   # Más épocas que antes (40)
MAX_PER_CLASS = 2000
MIN_PER_CLASS = 100
VAL_SPLIT = 0.15
TEST_SPLIT = 0.15
LABEL_SMOOTHING = 0.1

CLASS_NAMES = [
    "Fresh_FreshApple", "Fresh_FreshBanana", "Fresh_FreshBellpepper",
    "Fresh_FreshBittergroud", "Fresh_FreshCapciscum", "Fresh_FreshCarrot",
    "Fresh_FreshCucumber", "Fresh_FreshMango", "Fresh_FreshOkara",
    "Fresh_FreshOrange", "Fresh_FreshPotato", "Fresh_FreshStrawberry",
    "Fresh_FreshTomato", "Rotten_RottenApple", "Rotten_RottenBanana",
    "Rotten_RottenBellpepper", "Rotten_RottenBittergroud", "Rotten_RottenCapsicum",
    "Rotten_RottenCarrot", "Rotten_RottenCucumber", "Rotten_RottenMango",
    "Rotten_RottenOkra", "Rotten_RottenOrange", "Rotten_RottenPotato",
    "Rotten_RottenStrawberry", "Rotten_RottenTomato",
]
N_CLASSES = len(CLASS_NAMES)

PARALLEL_CALLS = tf.data.AUTOTUNE


def scan_dataset(root: str):
    """Escanea imágenes y retorna dict {class_name: [paths]}."""
    root = Path(root)
    class_files = defaultdict(list)
    VALID_EXT = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
    for img_path in root.rglob('*'):
        if img_path.suffix.lower() in VALID_EXT:
            parts = img_path.parts
            if len(parts) >= 2:
                class_name = f'{img_path.parent.parent.name}_{img_path.parent.name}'
                if class_name in CLASS_NAMES:
                    class_files[class_name].append(str(img_path))
    return dict(class_files)


def make_tf_dataset(paths, labels, augment=False, shuffle=False):
    """Crea pipeline tf.data optimizado."""

    @tf.function
    def load_image_and_label(path, label):
        raw = tf.io.read_file(path)
        img = tf.image.decode_image(raw, channels=3, expand_animations=False)
        img.set_shape([None, None, 3])
        img = tf.image.resize(img, [IMG_SIZE, IMG_SIZE])
        img = tf.cast(img, tf.float32)
        label_oh = tf.one_hot(label, N_CLASSES)
        return img, label_oh

    @tf.function
    def augment_image(img, label):
        # Geometrico
        img = tf.image.random_flip_left_right(img)
        img = tf.image.random_flip_up_down(img)
        # Zoom aleatorio
        crop_frac = tf.random.uniform([], 0.85, 1.0)
        h = tf.cast(tf.shape(img)[0], tf.float32)
        w = tf.cast(tf.shape(img)[1], tf.float32)
        crop_h = tf.cast(h * crop_frac, tf.int32)
        crop_w = tf.cast(w * crop_frac, tf.int32)
        img = tf.image.random_crop(img, size=[crop_h, crop_w, 3])
        img = tf.image.resize(img, [IMG_SIZE, IMG_SIZE])
        # Color
        img = tf.image.random_brightness(img, max_delta=0.25)
        img = tf.image.random_contrast(img, lower=0.75, upper=1.25)
        img = tf.image.random_saturation(img, lower=0.7, upper=1.3)
        img = tf.image.random_hue(img, max_delta=0.05)
        img = tf.clip_by_value(img, 0.0, 255.0)
        return img, label

    @tf.function
    def apply_efficientnet_preprocessing(img, label):
        img = tf.keras.applications.efficientnet_v2.preprocess_input(img)
        return img, label

    ds = tf.data.Dataset.from_tensor_slices((paths, labels))
    if shuffle:
        ds = ds.shuffle(buffer_size=1024, seed=SEED, reshuffle_each_iteration=True)
    ds = ds.map(load_image_and_label, num_parallel_calls=PARALLEL_CALLS)
    if augment:
        ds = ds.map(augment_image, num_parallel_calls=PARALLEL_CALLS)
    ds = ds.batch(BATCH_SIZE, drop_remainder=False)
    ds = ds.map(apply_efficientnet_preprocessing, num_parallel_calls=PARALLEL_CALLS)
    ds = ds.prefetch(tf.data.AUTOTUNE)
    return ds


def build_model():
    """Construye el MISMO modelo EfficientNetV2-S que ya usas."""
    print('Construyendo EfficientNetV2-S (misma arquitectura)...')

    base_model = keras.applications.EfficientNetV2S(
        include_top=False,
        weights='imagenet',
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )
    base_model.trainable = False

    inputs = keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3), name='input_image')
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D(name='avg_pool')(x)
    x = layers.BatchNormalization(name='bn_top')(x)
    x = layers.Dropout(0.4, name='dropout_1')(x)
    x = layers.Dense(512, activation='relu', name='dense_512',
                     kernel_regularizer=keras.regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization(name='bn_dense')(x)
    x = layers.Dropout(0.3, name='dropout_2')(x)
    outputs = layers.Dense(N_CLASSES, activation='softmax', name='predictions')(x)

    model = keras.Model(inputs, outputs, name='FruitQuality_v2')

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss=keras.losses.CategoricalCrossentropy(label_smoothing=LABEL_SMOOTHING),
        metrics=['accuracy']
    )

    total = model.count_params()
    trainable = sum([np.prod(v.shape) for v in model.trainable_variables])
    print(f'   Total params: {total:,}')
    print(f'   Trainable: {trainable:,}')

    return model, base_model


def train_phase_head(model, train_ds, val_ds, class_weights, output_dir):
    """Fase 1: Entrenamiento de cabeza."""
    print(f'\nFASE 1: HEAD TRAINING — {HEAD_EPOCHS} épocas')

    ckpt_path = os.path.join(output_dir, 'head_best.keras')
    os.makedirs(os.path.dirname(ckpt_path), exist_ok=True)

    callbacks = [
        keras.callbacks.ModelCheckpoint(
            filepath=ckpt_path, monitor='val_accuracy',
            save_best_only=True, verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy', patience=10,
            restore_best_weights=True, verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_accuracy', factor=0.5,
            patience=5, min_lr=1e-6, verbose=1
        ),
    ]

    history = model.fit(
        train_ds, validation_data=val_ds,
        epochs=HEAD_EPOCHS, callbacks=callbacks,
        class_weight=class_weights
    )

    best_acc = max(history.history['val_accuracy'])
    print(f'\nFASE 1 completada. Mejor val_accuracy: {best_acc*100:.2f}%')
    return ckpt_path


def train_phase_finetune(model, train_ds, val_ds, class_weights, output_dir, base_model):
    """Fase 2: Fine-tuning últimas 50 capas."""
    print(f'\nFASE 2: FINE-TUNING — {FINE_EPOCHS} épocas')

    ckpt_path = os.path.join(output_dir, 'finetune_best.keras')

    base_model.trainable = True
    FINE_TUNE_AT = len(base_model.layers) - 50
    for layer in base_model.layers[:FINE_TUNE_AT]:
        layer.trainable = False

    FINE_LR = 2e-5
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=FINE_LR),
        loss=keras.losses.CategoricalCrossentropy(label_smoothing=LABEL_SMOOTHING),
        metrics=['accuracy']
    )

    callbacks = [
        keras.callbacks.ModelCheckpoint(
            filepath=ckpt_path, monitor='val_accuracy',
            save_best_only=True, verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy', patience=12,
            restore_best_weights=True, verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_accuracy', factor=0.3,
            patience=5, min_lr=1e-7, verbose=1
        ),
    ]

    history = model.fit(
        train_ds, validation_data=val_ds,
        epochs=FINE_EPOCHS, callbacks=callbacks,
        class_weight=class_weights
    )

    best_acc = max(history.history['val_accuracy'])
    print(f'\nFASE 2 completada. Mejor val_accuracy: {best_acc*100:.2f}%')
    return ckpt_path


def export_model(model, output_dir):
    """Exporta .keras y metadata."""
    os.makedirs(output_dir, exist_ok=True)

    keras_path = os.path.join(output_dir, 'fruit_classifier.keras')
    model.save(keras_path)
    size_mb = os.path.getsize(keras_path) / 1e6
    print(f'\nModelo guardado: {keras_path} ({size_mb:.1f} MB)')

    meta = {
        'model_name': model.name,
        'architecture': 'EfficientNetV2-S',
        'input_shape': [IMG_SIZE, IMG_SIZE, 3],
        'num_classes': N_CLASSES,
        'class_names': CLASS_NAMES,
        'preprocessing': 'efficientnet_v2.preprocess_input',
        'size_mb': round(size_mb, 2),
    }
    meta_path = os.path.join(output_dir, 'model_metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)
    print(f'Metadata guardada: {meta_path}')

    return keras_path


def main():
    parser = argparse.ArgumentParser(description='Reentrena BanNano (misma arquitectura V2-S)')
    parser.add_argument('--dataset', required=True, help='Ruta al dataset')
    parser.add_argument('--output', default='./model_new', help='Directorio de salida')
    parser.add_argument('--batch-size', type=int, default=BATCH_SIZE)
    args = parser.parse_args()

    os.makedirs(args.output, exist_ok=True)

    # 1. Escanear
    print('Escaneando dataset...')
    class_files = scan_dataset(args.dataset)
    total_imgs = sum(len(v) for v in class_files.values())
    print(f'   Total imágenes: {total_imgs}')

    # 2. Balanceo y split
    clean = {}
    for cls in CLASS_NAMES:
        files = class_files.get(cls, [])
        if len(files) > MAX_PER_CLASS:
            random.seed(SEED)
            files = random.sample(files, MAX_PER_CLASS)
        clean[cls] = files

    split_paths = {'train': [], 'val': [], 'test': []}
    split_labels = {'train': [], 'val': [], 'test': []}

    for cls_idx, cls in enumerate(CLASS_NAMES):
        files = clean[cls]
        if len(files) < MIN_PER_CLASS:
            print(f'Clase {cls} tiene solo {len(files)} imágenes (mínimo {MIN_PER_CLASS})')
            continue
        tv, test = train_test_split(files, test_size=TEST_SPLIT, random_state=SEED)
        val_frac = VAL_SPLIT / (1.0 - TEST_SPLIT)
        train, val = train_test_split(tv, test_size=val_frac, random_state=SEED)
        for s, subset in [('train', train), ('val', val), ('test', test)]:
            split_paths[s].extend(subset)
            split_labels[s].extend([cls_idx] * len(subset))

    print(f"   Train: {len(split_paths['train'])} | Val: {len(split_paths['val'])} | Test: {len(split_paths['test'])}")

    # 3. Datasets
    train_ds = make_tf_dataset(split_paths['train'], split_labels['train'], augment=True, shuffle=True)
    val_ds = make_tf_dataset(split_paths['val'], split_labels['val'])

    # 4. Class weights
    cw_array = compute_class_weight('balanced', classes=np.unique(split_labels['train']), y=split_labels['train'])
    class_weights = dict(enumerate(cw_array))

    # 5. Modelo (misma arquitectura)
    model, base_model = build_model()

    # 6. Entrenamiento
    head_ckpt = train_phase_head(model, train_ds, val_ds, class_weights, args.output)
    model = keras.models.load_model(head_ckpt)
    fine_ckpt = train_phase_finetune(model, train_ds, val_ds, class_weights, args.output, base_model)

    # 7. Exportar
    model = keras.models.load_model(fine_ckpt)
    export_model(model, args.output)

    print('\nListo. Copia fruit_classifier.keras a backend/model/ y sube a Hugging Face.')


if __name__ == '__main__':
    main()

import json, sys

labels = [
    'Fresh_FreshApple','Fresh_FreshBanana','Fresh_FreshBellpepper','Fresh_FreshBittergroud',
    'Fresh_FreshCapciscum','Fresh_FreshCarrot','Fresh_FreshCucumber','Fresh_FreshMango',
    'Fresh_FreshOkara','Fresh_FreshOrange','Fresh_FreshPotato','Fresh_FreshStrawberry',
    'Fresh_FreshTomato',
    'Rotten_RottenApple','Rotten_RottenBanana','Rotten_RottenBellpepper','Rotten_RottenBittergroud',
    'Rotten_RottenCapsicum','Rotten_RottenCarrot','Rotten_RottenCucumber','Rotten_RottenMango',
    'Rotten_RottenOkra','Rotten_RottenOrange','Rotten_RottenPotato','Rotten_RottenStrawberry',
    'Rotten_RottenTomato',
]

data = json.load(sys.stdin)
probs = data["all_probabilities"]
idx_sorted = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)

print("TOP 3 PREDICCIONES:")
for i in range(3):
    idx = idx_sorted[i]
    bar = "#" * int(probs[idx] * 50)
    print(f"  {i+1}. {labels[idx]:30s} = {probs[idx]*100:5.1f}%  {bar}")

print()
print(f"Clase ganadora : {data['class_name']}")
print(f"Confianza      : {data['confidence']*100:.1f}%")
print(f"Es fresca      : {data['is_fresh']}")
print(f"Tiene heatmap  : {'heatmap_base64' in data}")

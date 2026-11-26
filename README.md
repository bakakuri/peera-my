# Peera.My

უცხო ენების სწავლის აპი: SRS ბარათები, გაკვეთილები, პროგრესი. სუფთა HTML/CSS/JS, build არ სჭირდება.

## ლოკალურად გაშვება
```
python3 -m http.server 8000
```
გახსენი `http://localhost:8000`. Supabase-ის გარეშე მუშაობს **დემო რეჟიმში** (მონაცემები `data/words.json`-იდან, პროგრესი localStorage-ში).

## Supabase-ის მიერთება
1. შექმენი პროექტი supabase.com-ზე.
2. SQL Editor-ში გაუშვი `supabase/schema.sql`, მერე `supabase/seed.sql`.
3. Project Settings → API: ჩაწერე **URL** და **anon key** ფაილში `js/config.js`.
4. Authentication → Providers: ჩართე Email (სურვილის მიხედვით გამორთე დადასტურება ტესტისთვის).
5. ახალი სიტყვის დასამატებლად ჩასვი ჩანაწერი `words` ცხრილში (`data` = შენი JSON) ან დაამატე `seed.sql`-ში.

## Termux → GitHub → Vercel
```
unzip -o peera-my.zip -d peera-my && cd peera-my
git add -A && git commit -m "Peera.My" && git push
```
Vercel-ზე: Import repo → Framework: **Other**, Build command ცარიელი, Output directory `.` (root).

## JSON ფორმატი (შენიშვნა)
- `core.phonetic.georgian` = `{transcription, syllables[], stressIndex}`
- მაგალითებში `highlight` არის ტექსტი (არა ინდექსები)
- collocations: `{text, ka}`

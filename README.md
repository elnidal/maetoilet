# 🚽 Ofis Tuvalet Takip Uygulaması

Ofis tuvaletinin müsait mi yoksa dolu mu olduğunu gösteren basit ve kullanışlı bir web uygulaması.

## Özellikler

✅ **Gerçek Zamanlı Durum** - Tuvaletin müsait/dolu durumunu anında görün
✅ **Giriş/Çıkış Sistemi** - Kullanıcılar kolayca giriş ve çıkış yapabilir
✅ **Otomatik Çıkış** - 30 dakika sonra otomatik olarak çıkış yapar
✅ **Kullanıcı Takibi** - Kim kullanıyor ve ne kadar süredir
✅ **Mobil Uyumlu** - iPhone ve tüm cihazlarda mükemmel çalışır
✅ **Otomatik Yenileme** - Her 5 saniyede bir durum güncellenir

## Kurulum

### 1. Python'u Yükleyin (Eğer yoksa)
Mac'te zaten Python yüklü olmalı. Kontrol etmek için:
```bash
python3 --version
```

### 2. Gerekli Paketleri Yükleyin
```bash
cd "/Users/muratozturk/Desktop/TUVALET APP"
pip3 install -r requirements.txt
```

### 3. Uygulamayı Başlatın
```bash
python3 app.py
```

### 4. Tarayıcıda Açın
Tarayıcınızda şu adresi açın:
```
http://localhost:5000
```

## iPhone'da Kullanım

1. Safari'de uygulamayı açın
2. Paylaş butonuna tıklayın
3. "Ana Ekrana Ekle" seçin
4. Artık normal bir uygulama gibi kullanabilirsiniz!

## Ofisteki Diğer Kişilerle Paylaşma

### Aynı WiFi Ağındaysanız:
1. Mac'inizin IP adresini öğrenin:
   - Sistem Ayarları > Ağ > WiFi
   - IP adresinizi not edin (örn: 192.168.1.100)

2. Diğer kişiler şu adresi açsın:
   ```
   http://[SIZIN-IP-ADRESINIZ]:5000
   ```

### İnternetten Erişim İçin (Ücretsiz Deployment):

**Render.com ile (Önerilen):**
1. render.com'da hesap açın
2. "New Web Service" oluşturun
3. Bu klasörü GitHub'a yükleyin
4. Render'da GitHub repo'nuzu bağlayın
5. Herkes internetten erişebilir!

**Railway.app ile:**
1. railway.app'te hesap açın
2. "New Project" > "Deploy from GitHub"
3. Ücretsiz domain alın

## Teknik Detaylar

- **Backend:** Flask (Python)
- **Database:** SQLite
- **Frontend:** HTML, CSS, JavaScript
- **Otomatik Çıkış:** 30 dakika
- **Yenileme Süresi:** 5 saniye

## Özelleştirme

### Otomatik Çıkış Süresini Değiştirme
`app.py` dosyasında 30. satırı bulun:
```python
if datetime.utcnow() - status.check_in_time > timedelta(minutes=30):
```
`30` değerini istediğiniz dakika sayısıyla değiştirin.

### Yenileme Süresini Değiştirme
`templates/index.html` dosyasında şu satırı bulun:
```javascript
setInterval(updateStatus, 5000);
```
`5000` değerini değiştirin (milisaniye cinsinden, 5000 = 5 saniye).

## Sorun Giderme

**Port zaten kullanımda hatası:**
```bash
lsof -ti:5000 | xargs kill -9
```

**Veritabanı hatası:**
```bash
rm toilet.db
python3 app.py
```

## Destek

Herhangi bir sorun yaşarsanız, bana sorabilirsiniz!

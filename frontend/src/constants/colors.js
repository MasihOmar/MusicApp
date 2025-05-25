// src/constants/colors.js
export default {
  primary: '#00C6FF',        // Buz mavisi
  primaryLight: '#7AE7FF',   // Açık buz mavisi
  primaryDark: '#0085FF',    // Koyu buz mavisi
  
  background: '#0A0E17',     // Çok koyu lacivert (neredeyse siyah)
  backgroundLight: '#141D31', // Biraz daha açık lacivert
  backgroundDark: '#050810', // Daha koyu lacivert
  
  cardBackground: '#141D31', // Panel arkaplan rengi (biraz daha açık lacivert)
  cardBackgroundDark: '#0F1525', // Karanlık panel arkaplan rengi
  
  textPrimary: '#FFFFFF',    // Birincil yazı rengi (beyaz)
  textSecondary: '#B3B3B3',  // İkincil yazı rengi (gri)
  textHighlight: '#00C6FF',  // Vurgu yazı rengi (buz mavisi)
  
  divider: '#293555',        // Ayırıcı çizgi rengi (koyu mavi)
  error: '#FF5252',          // Hata rengi (kırmızı)
  success: '#4CAF50',        // Başarı rengi (yeşil)
  
  // Genişletilmiş gradyan koleksiyonu
  gradient: {
    // Ana tema gradyanları
    primary: ['#00C6FF', '#0072FF'],       // Buz mavisi gradyan
    dark: ['#141D31', '#0A0E17'],          // Lacivert gradyan
    
    // Müzik türleri için gradyanlar
    pop: ['#FF9966', '#FF5E62'],           // Turuncu-Kırmızı
    electronic: ['#4776E6', '#8E54E9'],    // Mavi-Mor
    rock: ['#232526', '#414345'],          // Metalik Gri-Siyah
    jazz: ['#1D976C', '#93F9B9'],          // Yeşil
    hiphop: ['#8E2DE2', '#4A00E0'],        // Mor
    classical: ['#834d9b', '#d04ed6'],     // Mor-Pembe
    indie: ['#1FA2FF', '#12D8FA', '#A6FFCB'], // Mavi-Turkuaz-Yeşil
    latin: ['#FF416C', '#FF4B2B'],         // Kırmızı-Turuncu
    
    // Ruh haline göre gradyanlar
    energetic: ['#F7971E', '#FFD200'],     // Turuncu-Sarı
    calm: ['#5D26C1', '#a17fe0', '#59C173'], // Mor-Yeşil
    focus: ['#076585', '#fff'],            // Mavi-Beyaz
    happy: ['#ffc3a0', '#ffafbd'],         // Pastel Pembe-Şeftali
    melancholic: ['#3a6186', '#89253e'],   // Lacivert-Bordo
    
    // Özel efekt gradyanları
    neon: ['#00F260', '#0575E6'],          // Neon Yeşil-Mavi
    sunset: ['#ff7e5f', '#feb47b'],        // Gün batımı
    ocean: ['#4286f4', '#373B44'],         // Okyanus
    galaxy: ['#0f0c29', '#302b63', '#24243e'], // Galaksi
    aurora: ['#0D324D', '#7F5A83'],        // Kuzey ışığı
    fire: ['#f12711', '#f5af19'],          // Ateş
    
    // Düğme ve kart gradyanları
    buttonPrimary: ['#00C6FF', '#0072FF'], // Ana düğme
    buttonSecondary: ['#8E2DE2', '#4A00E0'], // İkincil düğme
    buttonWarning: ['#F7971E', '#FFD200'],  // Uyarı düğmesi
    cardPrimary: ['#141E30', '#243B55'],   // Ana kart
    cardHighlight: ['#0A0E17', '#1A1A2E']  // Vurgulu kart
  }
};
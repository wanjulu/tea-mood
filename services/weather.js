const WMO = {
  0: '晴天', 1: '晴時多雲', 2: '多雲', 3: '陰天',
  45: '霧', 48: '霧',
  51: '毛毛雨', 53: '毛毛雨', 55: '毛毛雨',
  61: '小雨', 63: '中雨', 65: '大雨',
  71: '小雪', 73: '中雪', 75: '大雪',
  80: '陣雨', 81: '陣雨', 82: '大陣雨',
  95: '雷雨', 96: '雷雨夾冰雹', 99: '雷雨夾冰雹',
};

export async function getWeather() {
  const res = await fetch(
    'https://api.open-meteo.com/v1/forecast?latitude=25.033&longitude=121.564&current=temperature_2m,weathercode'
  );
  if (!res.ok) throw new Error('weather api error');
  const { current } = await res.json();
  return {
    weather: WMO[current.weathercode] ?? '未知',
    temperature: current.temperature_2m,
  };
}

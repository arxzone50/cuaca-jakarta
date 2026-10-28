import { ref, computed, onMounted } from 'vue';

export interface WeatherItem {
  time: string;
  temperature: number;
}

interface WeatherApiResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

interface UseWeatherOptions {
  latitude?: number;
  longitude?: number;
  pageSize?: number;
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function useWeather(options: UseWeatherOptions = {}) {
  const { latitude = -6.2, longitude = 106.8, pageSize = 10 } = options;

  const weather = ref<WeatherItem[]>([]);
  const loading = ref(false);
  const error = ref('');
  const currentPage = ref(1);

  async function fetchWeather() {
    loading.value = true;
    error.value = '';

    try {
      const url =
        'https://api.open-meteo.com/v1/forecast' +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        '&hourly=temperature_2m' +
        '&timezone=Asia%2FJakarta';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Gagal mengambil data dari server.');
      }

      const data = (await response.json()) as WeatherApiResponse;

      if (!data.hourly?.time || !data.hourly?.temperature_2m) {
        throw new Error('Format data cuaca tidak sesuai.');
      }

      weather.value = data.hourly.time
        .map((time, index) => ({
          time,
          temperature: data.hourly.temperature_2m[index],
        }))
        .filter((item) => Number.isFinite(item.temperature));

      currentPage.value = 1;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data cuaca.';
    } finally {
      loading.value = false;
    }
  }

  const totalPages = computed(() => Math.max(1, Math.ceil(weather.value.length / pageSize)));

  const paginatedWeather = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return weather.value.slice(start, start + pageSize);
  });

  const startItem = computed(() => (weather.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize + 1));

  const endItem = computed(() => Math.min(currentPage.value * pageSize, weather.value.length));

  const visiblePages = computed(() => {
    const pages: number[] = [];
    const start = Math.max(1, Math.min(currentPage.value - 2, totalPages.value - 4));
    const end = Math.min(totalPages.value, start + 4);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    return pages;
  });

  const averageTemperature = computed(() => {
    if (weather.value.length === 0) return '--';

    const total = weather.value.reduce((sum, item) => sum + item.temperature, 0);

    return (total / weather.value.length).toFixed(1);
  });

  const currentWeather = computed(() => {
    if (weather.value.length === 0) return undefined;

    const now = new Date();
    const currentHour =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` +
      `T${String(now.getHours()).padStart(2, '0')}:00`;

    return weather.value.find((item) => item.time === currentHour) ?? weather.value[0];
  });

  const currentTemperature = computed(() =>
    currentWeather.value ? currentWeather.value.temperature.toFixed(1) : null,
  );

  const currentTimeLabel = computed(() =>
    currentWeather.value
      ? `${formatDate(currentWeather.value.time)}, pukul ${formatTime(currentWeather.value.time)}`
      : 'belum tersedia',
  );

  function formatDate(dateTime: string) {
    const [date] = dateTime.split('T');
    const [year, month, day] = date.split('-').map(Number);
    const dateObject = new Date(year, month - 1, day);

    return dateObject.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatTime(dateTime: string) {
    return dateTime.split('T')[1]?.slice(0, 5) ?? '--:--';
  }

  function changePage(page: number) {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
  }

  onMounted(fetchWeather);

  return {
    weather,
    loading,
    error,
    currentPage,
    pageSize,
    fetchWeather,
    totalPages,
    paginatedWeather,
    startItem,
    endItem,
    visiblePages,
    averageTemperature,
    currentTemperature,
    currentTimeLabel,
    formatDate,
    formatTime,
    changePage,
  };
}

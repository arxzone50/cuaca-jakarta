<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <main class="dashboard">
        <!-- Header -->
        <header class="header">
          <div class="brand">
            <div class="brand-icon">
              <ion-icon :icon="sunnyOutline" />
            </div>
            <div>
              <h1>Cuaca Jakarta</h1>
            </div>
          </div>

          <button class="refresh-button" @click="fetchWeather" :disabled="loading">
            <ion-icon :icon="refreshOutline" :class="{ spinning: loading }" />
            <span>Perbarui</span>
          </button>
        </header>

        <!-- Error -->
        <div v-if="error" class="error-message">
          <ion-icon :icon="alertCircleOutline" />
          <span>{{ error }}</span>
          <button @click="fetchWeather">Coba lagi</button>
        </div>

        <!-- Loading -->
        <div v-if="loading && weather.length === 0" class="loading">
          <ion-spinner name="crescent" />
          <p>Mengambil data cuaca...</p>
        </div>

        <template v-else>
          <!-- Hero -->
          <section class="hero-card">
            <div class="hero-content">
              <div class="location-label">
                <ion-icon :icon="locationOutline" />
                JAKARTA, INDONESIA
              </div>

              <div class="temperature">
                <span>{{ currentTemperature ?? '--' }}</span>
                <span class="degree">°C</span>
              </div>

              <p class="temperature-label">
                Suhu pada {{ currentTimeLabel }}
              </p>
            </div>

            <div class="hero-weather-icon">
              <ion-icon :icon="partlySunnyOutline" />
            </div>

            <div class="hero-decoration decoration-one"></div>
            <div class="hero-decoration decoration-two"></div>
          </section>

          <!-- Statistics -->
          <section class="stats-grid">
            <article class="stat-card">
              <div class="stat-icon">
                <ion-icon :icon="statsChartOutline" />
              </div>

              <div class="stat-info">
                <p>Total Data</p>
                <h3>{{ weather.length }} <small>data</small></h3>
              </div>
            </article>

            <article class="stat-card">
              <div class="stat-icon">
                <ion-icon :icon="thermometerOutline" />
              </div>

              <div class="stat-info">
                <p>Rata-rata Suhu</p>
                <h3>{{ averageTemperature }} <small>°C</small></h3>
              </div>
            </article>
          </section>

          <!-- Weather table -->
          <section class="data-card">
            <div class="section-heading">
              <div>
                <h2>Data Prakiraan Cuaca</h2>
              </div>

              <div class="source-badge">
                <span class="source-dot"></span>
                Open-Meteo
              </div>
            </div>

            <div v-if="weather.length === 0" class="empty-state">
              <ion-icon :icon="cloudOutline" />
              <h3>Belum ada data</h3>
              <p>Silakan perbarui data cuaca.</p>
            </div>

            <template v-else>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th class="number-column">No.</th>
                      <th>Waktu</th>
                      <th class="temperature-column">Suhu</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="(item, index) in paginatedWeather" :key="item.time">
                      <td class="number-column">
                        <span class="row-number">
                          {{ (currentPage - 1) * pageSize + index + 1 }}
                        </span>
                      </td>

                      <td>
                        <div class="datetime-cell">
                          <span class="datetime-date">{{ formatDate(item.time) }}</span>
                          <span class="datetime-time">
                            <ion-icon :icon="timeOutline" />
                            {{ formatTime(item.time) }}
                          </span>
                        </div>
                      </td>

                      <td class="temperature-column">
                        <div class="temperature-cell">
                          <strong>
                            {{ item.temperature.toFixed(1) }}<span>°C</span>
                          </strong>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div class="pagination">
                <p class="pagination-info">
                  Data <strong>{{ startItem }}–{{ endItem }}</strong>
                  dari <strong>{{ weather.length }}</strong>
                </p>

                <div class="pagination-controls">
                  <button class="page-button arrow-button" :disabled="currentPage === 1" aria-label="Halaman sebelumnya"
                    @click="changePage(currentPage - 1)">
                    <ion-icon :icon="chevronBackOutline" />
                  </button>

                  <button v-for="page in visiblePages" :key="page" class="page-button"
                    :class="{ active: currentPage === page }" :aria-label="`Halaman ${page}`" @click="changePage(page)">
                    {{ page }}
                  </button>

                  <button class="page-button arrow-button" :disabled="currentPage === totalPages"
                    aria-label="Halaman selanjutnya" @click="changePage(currentPage + 1)">
                    <ion-icon :icon="chevronForwardOutline" />
                  </button>
                </div>
              </div>
            </template>
          </section>

          <!-- Centered footer -->
          <footer class="footer">
            <div class="footer-brand">
              <ion-icon :icon="cloudOutline" />
              <span>Cuaca Jakarta</span>
            </div>

            <p>
              Data cuaca disediakan oleh
              <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
                Open-Meteo
              </a>
            </p>

            <span class="footer-copyright">
              © 2026 · 048452033 Michael Alfa Liesto Siahaan
            </span>
          </footer>
        </template>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonIcon,
  IonPage,
  IonSpinner
} from '@ionic/vue'

import {
  alertCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  cloudOutline,
  locationOutline,
  partlySunnyOutline,
  refreshOutline,
  statsChartOutline,
  sunnyOutline,
  thermometerOutline,
  timeOutline,
} from 'ionicons/icons'

import './HomePage.css'
import { useWeather } from './useWeather'

const {
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
  changePage
} = useWeather()
</script>

<script setup>
import { ref, reactive } from 'vue'
import LoginPage from './components/LoginPage.vue'
import Dashboard from './components/Dashboard.vue'
import { clearToken } from './api.js'

// Global app state
const state = reactive({
  currentUser: JSON.parse(localStorage.getItem('user')) || null,
  loading: false
})

function setUser(user) {
  state.currentUser = user
  localStorage.setItem('user', JSON.stringify(user))
}
function setLoading(val) {
  state.loading = val
}
function logout() {
  state.currentUser = null
  localStorage.removeItem('user')
  clearToken()
}
</script>

<template>
  <div>
    <!-- Loading Overlay -->
    <div v-if="state.loading" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <LoginPage v-if="!state.currentUser" @login="setUser" />
    <Dashboard v-else :user="state.currentUser" @logout="logout" :set-loading="setLoading" />
  </div>
</template>

<style>
* { font-family: 'Inter', sans-serif; }
</style>

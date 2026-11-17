import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Grade } from '../types'
import { useApi } from '../composables/useApi'

export const useGradeStore = defineStore('grade', () => {
  const grades = ref<Grade[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { fetchWithAuth } = useApi()

  const fetchGrades = async () => {
    loading.value = true
    error.value = null
    const { data, error: fetchError } = await fetchWithAuth('/grades')
    
    if (fetchError) {
      error.value = fetchError
    } else if (data) {
      grades.value = data.map((g: any) => ({
        id: g.id,
        studentId: g.studentId,
        studentName: g.studentName,
        subject: g.subject,
        score: g.score,
        date: g.date
      }))
    }
    loading.value = false
  }

  const addGrade = async (grade: Omit<Grade, 'id'>) => {
    loading.value = true
    const { data, error: fetchError } = await fetchWithAuth('/grades', {
      method: 'POST',
      body: JSON.stringify({
        studentId: grade.studentId,
        studentName: grade.studentName,
        subject: grade.subject,
        score: grade.score,
        date: grade.date
      })
    })
    
    if (fetchError) {
      error.value = fetchError
      loading.value = false
      return false
    }
    
    if (data) {
      grades.value.push({
        id: data.id,
        studentId: data.studentId,
        studentName: data.studentName,
        subject: data.subject,
        score: data.score,
        date: data.date
      })
    }
    loading.value = false
    return true
  }

  const updateGrade = async (id: string, updates: Partial<Grade>) => {
    loading.value = true
    const backendUpdates: any = {}
    if (updates.studentId) backendUpdates.studentId = updates.studentId
    if (updates.studentName) backendUpdates.studentName = updates.studentName
    if (updates.subject) backendUpdates.subject = updates.subject
    if (updates.score !== undefined) backendUpdates.score = updates.score
    if (updates.date) backendUpdates.date = updates.date

    const { data, error: fetchError } = await fetchWithAuth(`/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendUpdates)
    })
    
    if (fetchError) {
      error.value = fetchError
      loading.value = false
      return false
    }
    
    if (data) {
      const index = grades.value.findIndex(g => g.id === id)
      if (index !== -1) {
        grades.value[index] = {
          id: data.id,
          studentId: data.studentId,
          studentName: data.studentName,
          subject: data.subject,
          score: data.score,
          date: data.date
        }
      }
    }
    loading.value = false
    return true
  }

  const deleteGrade = async (id: string) => {
    loading.value = true
    const { error: fetchError } = await fetchWithAuth(`/grades/${id}`, {
      method: 'DELETE'
    })
    
    if (fetchError) {
      error.value = fetchError
      loading.value = false
      return false
    }
    
    grades.value = grades.value.filter(g => g.id !== id)
    loading.value = false
    return true
  }

  return {
    grades,
    loading,
    error,
    fetchGrades,
    addGrade,
    updateGrade,
    deleteGrade
  }
})

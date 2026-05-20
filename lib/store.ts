import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface QuestionnaireData {
  budget: string | null // '100k', '200k', '300k', 'above'
  softwareChoice: string | null // 'capcut', 'adobe_premiere', 'davinci_resolve'
  answered: boolean
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
  compatibleSoftware?: string[]
}

interface Store {
  questionnaire: QuestionnaireData
  setQuestionnaireData: (data: Partial<QuestionnaireData>) => void
  resetQuestionnaire: () => void
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateCartQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const initialQuestionnaire: QuestionnaireData = {
  budget: null,
  softwareChoice: null,
  answered: false,
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      questionnaire: initialQuestionnaire,
      setQuestionnaireData: (data) =>
        set((state) => ({
          questionnaire: {
            ...state.questionnaire,
            ...data,
            answered: data.budget !== undefined || data.softwareChoice !== undefined ? true : state.questionnaire.answered,
          },
        })),
      resetQuestionnaire: () =>
        set({
          questionnaire: initialQuestionnaire,
        }),
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((c) => c.id === item.id)
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.id === item.id
                  ? { ...c, quantity: c.quantity + item.quantity }
                  : c
              ),
            }
          }
          return { cart: [...state.cart, item] }
        }),
      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((c) => c.id !== id),
        })),
      updateCartQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((c) =>
            c.id === id ? { ...c, quantity } : c
          ),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'nova-gadgets-store',
    }
  )
)

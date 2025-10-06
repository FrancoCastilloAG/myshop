import toast from 'react-hot-toast'

export const notifyAddToCart = () =>
  toast.success('Producto agregado al carrito')

export const notifyLoginRequired = () =>
  toast.error('Debes iniciar sesión para continuar con el checkout')

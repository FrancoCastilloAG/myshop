export const notifyStockLimit = (stock: number) =>
  toast.error(`No puedes agregar más de ${stock} unidades de esta talla al carrito.`)
import toast from 'react-hot-toast'

export const notifyAddToCart = () =>
  toast.success('Producto agregado al carrito')

export const notifyLoginRequired = () =>
  toast.error('Debes iniciar sesión para continuar con el checkout')

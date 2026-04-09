import clsx from 'clsx'
import { type ReactElement } from 'react'

type BackdropProps = {
  onClose: () => void
}

export const Backdrop = ({ onClose }: BackdropProps): ReactElement => (
  <div
    className={clsx('fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out z-10')}
    onClick={onClose}
    role="presentation"
  />
)

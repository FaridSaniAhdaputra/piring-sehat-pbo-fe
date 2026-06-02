import { playClickSound } from '../../utils/audioSynth'

export default function RetroButton({
  children,
  onClick,
  type = 'button',
  primary = false,
  disabled = false,
  className = '',
  ...props
}) {
  const handleClick = (e) => {
    if (!disabled) {
      playClickSound()
    }
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`retro-btn ${primary ? 'retro-btn-primary' : ''} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}


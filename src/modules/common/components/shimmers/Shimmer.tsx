import { CSSProperties } from 'react'

interface ShimmerProps {
  height?: string | number
  width?: string | number
  style?: CSSProperties
  className?: any
}
const Shimmer = (props: ShimmerProps) => {
  let styles: CSSProperties = {}
  styles.height = props.height
  if (props.width) {
    styles.width = props.width
  }
  if (props.style) {
    styles = { ...styles, ...props.style }
    // cLog(props.style)
  }
  return (
    <div style={styles} className={`animated-background ${props?.className}`}>
      {' '}
    </div>
  )
}

export default Shimmer

import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'

const Ratings = ({ rating = 0, max = 5 }) => {
  const re: any = []
  for (let index = 0; index < max; index++) {
    if (rating <= index) {
      re.push(<StarBorderIcon fontSize={'medium'} className={'text-secondary'} />)
    } else {
      re.push(
        <StarIcon
          fontSize={'medium'}
          className={
            rating > 2 && rating <= 3 ? 'text-warning' : rating > 3 ? 'text-success' : 'text-danger'
          }
        />
      )
    }
  }
  return <span className='ratings'>{re}</span>
}

export default Ratings

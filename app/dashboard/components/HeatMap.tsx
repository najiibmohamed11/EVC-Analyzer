import React from 'react'

function HeatMap() {
    const containers=Array.from({length:90},(_,index)=>index)
  return (
    <div className='grid grid-cols-7 gap-1 '>
        {containers.map((i)=><div className='bg-green-300 w h-10'></div>)}
    </div>
  
  )
}

export default HeatMap
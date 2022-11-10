import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

function UserDetails() {

    const { id } = useParams();
    const [user, setUser] = useState();

    useEffect(() => {
        (async () => {

        })();
    }, [])

    return (
        <div className='user-details'>UserDetails</div>
    )
}

export default UserDetails
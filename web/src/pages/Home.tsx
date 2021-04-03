import React from 'react'
import { useUsersQuery } from '../generated/graphql'

interface Props {

}

export const Home: React.FC<Props> = (props: Props) => {
    const { data, loading, error } = useUsersQuery({ fetchPolicy: 'network-only' })

    // console.log(data, loading);
    if (!data || loading) return <div>Loading...</div>
    if (error) return <div>Error</div>

    return (<div>
        <div>Users</div>
        <ul>
            {data.users.map(item => <li key={item.id}>{item.email} - {item.id}</li>)}
        </ul>
    </div>)
}

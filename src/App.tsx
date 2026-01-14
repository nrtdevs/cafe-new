import { Suspense } from 'react'
import ChangePassword from './modules/meeting/views/users/ChnagePassword'
import UpdateViewProfile from './modules/meeting/views/users/UpdateViewPorfile'
import { useAppSelector } from './redux/store'
// ** Router Import
import Router from './router/Router'

const App = () => {
    const user = useAppSelector((stats) => stats.auth.userData)

    return (
        <Suspense fallback={null}>
            <UpdateViewProfile data={{ ...user }} />
            <ChangePassword data={{ ...user }} />
            <Router />
        </Suspense>
    )
}

export default App

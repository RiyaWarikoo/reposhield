import React, { Suspense } from 'react'
import LoginUI from '@/module/auth/components/login-ui'
import { requireUnAuth } from '@/module/auth/utils/auth-utils'
import { unstable_noStore as noStore } from 'next/cache'

const LoginPage = async () => {
    noStore();
    await requireUnAuth();
    return (
        <Suspense>
            <div>
                <LoginUI />
            </div>
        </Suspense>
    )
}

export default LoginPage
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest,) {
    const accessToken = req.cookies.get('access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({ error: 'No access token' }, { status: 401 })
    }

    try {
        const res = await fetch('http://103.172.79.28:8000/api/user/users/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!res.ok) {
            throw new Error('Failed to fetch user info')
        }

        const user = await res.json()
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 500 })
    }
}

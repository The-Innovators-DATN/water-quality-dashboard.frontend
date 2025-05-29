import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest,) {
    try {
        const token = req.cookies.get('access_token')?.value
        const res = await fetch('http://103.172.79.28:8000/api/user/users/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
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

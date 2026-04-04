import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
    try {
        const { email, phone, skipEmailCheck } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
        }

        // Check email uniqueness (skip for Google signup — email is already an Auth account)
        if (email && !skipEmailCheck) {
            const emailSnapshot = await adminDb.collection('users').where('email', '==', email).limit(1).get();
            if (!emailSnapshot.empty) {
                return NextResponse.json(
                    { error: 'This email is already registered. Please sign in.', field: 'email' },
                    { status: 409 }
                );
            }
        }

        // Check phone uniqueness — always enforced
        const phoneSnapshot = await adminDb.collection('users').where('phone', '==', phone).limit(1).get();
        if (!phoneSnapshot.empty) {
            return NextResponse.json(
                { error: 'This phone number is already registered. Please sign in.', field: 'phone' },
                { status: 409 }
            );
        }

        return NextResponse.json({ message: 'Unique' }, { status: 200 });
    } catch (error) {
        console.error('Error in check-unique API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

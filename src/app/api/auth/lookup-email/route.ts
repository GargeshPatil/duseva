import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
    try {
        const { identifier } = await request.json();

        if (!identifier) {
            return NextResponse.json({ error: 'Identifier is required' }, { status: 400 });
        }

        // Clean identifier just in case it's a phone missing the country code
        let formattedPhone = identifier.trim();
        if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
            formattedPhone = '+91' + formattedPhone;
        }

        // Check if the identifier exists as a phone number
        const phoneSnapshot = await adminDb.collection('users').where('phone', '==', formattedPhone).limit(1).get();
        if (!phoneSnapshot.empty) {
             const userData = phoneSnapshot.docs[0].data();
             if (userData.email) {
                 return NextResponse.json({ email: userData.email }, { status: 200 });
             }
        }

        return NextResponse.json({ error: 'No account found for this phone number.' }, { status: 404 });
    } catch (error) {
        console.error('Error in lookup-email API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

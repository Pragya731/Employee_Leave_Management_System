import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  console.log('Received leave request:', data);
  
  // Save data to database here...

  return NextResponse.json({ message: 'Leave request submitted successfully' }, { status: 201 });
}

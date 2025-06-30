import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, department, position, leaveBalance } = data

    if (!name || !department || !position || leaveBalance === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const newEmployee = {
      id: Date.now(), // mock ID generation
      name,
      department,
      position,
      leaveBalance: Number(leaveBalance),
    }

    console.log('Employee created:', newEmployee)

    return NextResponse.json(newEmployee, { status: 201 })
  } catch (error) {
    console.error('Failed to process request:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

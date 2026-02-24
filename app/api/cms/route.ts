import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (!type) return NextResponse.json({ ok: false, error: 'type is required' }, { status: 400 });

    try {
        let data: any[] = [];
        if (type === 'Questions') {
            const questions = await prisma.question.findMany({ orderBy: { order: 'asc' } });
            data = questions.map(q => [q.text, q.axis]);
        } else if (type === 'Results') {
            const results = await prisma.resultContent.findMany();
            data = [
                ["Code", "Title", "Features", "Aruaru", "Strength", "Caution", "ShareText", "ImageUrl"],
                ...results.map(r => [
                    r.code, r.title, JSON.stringify(r.feature), JSON.stringify(r.aruaru),
                    JSON.stringify(r.strength), JSON.stringify(r.caution), r.shareText, r.imageUrl || ''
                ])
            ];
        } else if (type === 'AxisDefinitions') {
            const axes = await prisma.axisDefinition.findMany();
            data = [
                ["Code", "Label", "Sub", "Desc"],
                ...axes.map(a => [a.code, a.label, a.sub, a.desc])
            ];
        } else {
            return NextResponse.json({ ok: false, error: 'unknown type' }, { status: 400 });
        }

        return NextResponse.json({ ok: true, data });
    } catch (error) {
        return NextResponse.json({ ok: false, error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    const providedPassword = req.headers.get('x-admin-password') || body.password;

    if (providedPassword !== adminPassword) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { type, rows } = body;

    try {
        if (type === 'Questions') {
            // rows: [[ "Text1", "Axis1" ], [ "Text2", "Axis2" ], ...]
            await prisma.question.deleteMany();
            await prisma.question.createMany({
                data: rows.map((r: any[], i: number) => ({ text: r[0], axis: r[1] || 'L-K', order: i }))
            });
        } else if (type === 'Results') {
            // rows: [[header], [data], ...]
            const dataRows = rows.slice(1);
            await prisma.resultContent.deleteMany();
            await prisma.resultContent.createMany({
                data: dataRows.map((r: any[]) => ({
                    code: r[0],
                    title: r[1],
                    feature: JSON.parse(r[2]),
                    aruaru: JSON.parse(r[3]),
                    strength: JSON.parse(r[4]),
                    caution: JSON.parse(r[5]),
                    shareText: r[6],
                    imageUrl: r[7] || null
                }))
            });
        } else if (type === 'AxisDefinitions') {
            const dataRows = rows.slice(1);
            await prisma.axisDefinition.deleteMany();
            await prisma.axisDefinition.createMany({
                data: dataRows.map((r: any[]) => ({
                    code: r[0],
                    label: r[1],
                    sub: r[2],
                    desc: r[3]
                }))
            });
        } else {
            return NextResponse.json({ ok: false, error: 'unknown type' }, { status: 400 });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ ok: false, error: 'Failed to update' }, { status: 500 });
    }
}

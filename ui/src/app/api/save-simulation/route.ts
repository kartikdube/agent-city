import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { scenarioId, simulationLog } = await req.json();

    if (!scenarioId || !simulationLog) {
      return NextResponse.json({ error: 'Missing scenarioId or simulationLog' }, { status: 400 });
    }

    // Path to the scenario JSON file
    const filePath = path.join(process.cwd(), 'public', 'scenarios', `${scenarioId}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `Scenario file not found: ${scenarioId}` }, { status: 404 });
    }

    // Read existing file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const scenarioData = JSON.parse(fileContent);

    // Update simulation_log
    scenarioData.simulation_log = simulationLog;

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(scenarioData, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: `Successfully saved simulation to ${scenarioId}.json` });

  } catch (error: any) {
    console.error('Error saving simulation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

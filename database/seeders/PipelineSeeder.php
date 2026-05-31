<?php

namespace Database\Seeders;

use App\Models\Pipeline;
use App\Models\PipelineStage;
use Illuminate\Database\Seeder;

class PipelineSeeder extends Seeder
{
    public function run(): void
    {
        $pipeline = Pipeline::create([
            'name' => 'Sales Pipeline',
            'description' => 'Default sales pipeline',
        ]);

        $stages = [
            ['name' => 'Nuevo', 'order' => 0, 'color' => '#6b7280'],
            ['name' => 'Cotizado', 'order' => 1, 'color' => '#f59e0b'],
            ['name' => 'Negociación', 'order' => 2, 'color' => '#3b82f6'],
            ['name' => 'Ganado', 'order' => 3, 'color' => '#22c55e'],
            ['name' => 'Perdido', 'order' => 4, 'color' => '#ef4444'],
        ];

        foreach ($stages as $stage) {
            PipelineStage::create([
                'pipeline_id' => $pipeline->id,
                ...$stage,
            ]);
        }
    }
}

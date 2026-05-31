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
            ['name' => 'Lead', 'order' => 0, 'color' => '#6b7280'],
            ['name' => 'Interesado', 'order' => 1, 'color' => '#f59e0b'],
            ['name' => 'Cliente', 'order' => 2, 'color' => '#3b82f6'],
        ];

        foreach ($stages as $stage) {
            PipelineStage::create([
                'pipeline_id' => $pipeline->id,
                ...$stage,
            ]);
        }
    }
}

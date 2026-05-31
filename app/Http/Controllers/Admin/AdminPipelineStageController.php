<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPipelineStageController extends Controller
{
    public function index(): JsonResponse
    {
        $pipeline = Pipeline::with('stages')->firstOrFail();

        return response()->json(['stages' => $pipeline->stages]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
        ]);

        $pipeline = Pipeline::firstOrFail();
        $maxOrder = PipelineStage::where('pipeline_id', $pipeline->id)->max('order');

        $stage = PipelineStage::create([
            'pipeline_id' => $pipeline->id,
            'name' => $data['name'],
            'color' => $data['color'],
            'order' => ($maxOrder ?? -1) + 1,
        ]);

        return response()->json(['stage' => $stage], 201);
    }

    public function update(Request $request, PipelineStage $pipelineStage): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
        ]);

        $pipelineStage->update($data);

        return response()->json(['stage' => $pipelineStage]);
    }

    public function destroy(PipelineStage $pipelineStage): JsonResponse
    {
        // Move deals to first stage or delete them
        $pipeline = Pipeline::with('stages')->firstOrFail();
        $firstStage = $pipeline->stages->first();

        if ($firstStage && $firstStage->id !== $pipelineStage->id) {
            Deal::where('stage_id', $pipelineStage->id)->update(['stage_id' => $firstStage->id]);
        }

        $pipelineStage->delete();

        return response()->json(['message' => 'Stage deleted']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'stages' => 'required|array',
            'stages.*.id' => 'required|exists:pipeline_stages,id',
            'stages.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->stages as $stageData) {
            PipelineStage::where('id', $stageData['id'])->update(['order' => $stageData['order']]);
        }

        return response()->json(['message' => 'Stages reordered']);
    }
}

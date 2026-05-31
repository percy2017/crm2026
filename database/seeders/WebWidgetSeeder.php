<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\WebConversation;
use App\Models\WebMessage;
use App\Models\WebVisitor;
use App\Models\WebWidget;
use Illuminate\Database\Seeder;

class WebWidgetSeeder extends Seeder
{
    public function run(): void
    {
        $widget = WebWidget::create([
            'name' => 'Soporte Principal',
            'domain' => 'localhost',
            'color' => '#3b82f6',
            'position' => 'right',
            'greeting' => 'Hola, ¿en qué podemos ayudarte?',
            'is_active' => true,
        ]);

        $this->command->info("Widget '{$widget->name}' created.");

        $admin = User::first();

        $visitors = [
            ['name' => 'Carlos Mendoza', 'email' => 'carlos@example.com', 'phone' => '59177111111'],
            ['name' => 'Laura Rivas', 'email' => 'laura@example.com', 'phone' => '59177222222'],
            ['name' => 'Pedro Vargas', 'email' => 'pedro@example.com', 'phone' => '59177333333'],
        ];

        $convData = [
            ['status' => 'active', 'visitor' => 0, 'messages' => 5],
            ['status' => 'pending', 'visitor' => 1, 'messages' => 2],
            ['status' => 'closed', 'visitor' => 2, 'messages' => 8],
        ];

        foreach ($convData as $i => $cd) {
            $v = $visitors[$cd['visitor']];

            $visitor = WebVisitor::create([
                'uuid' => fake()->uuid(),
                'name' => $v['name'],
                'email' => $v['email'],
                'phone' => $v['phone'],
                'ip' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
                'current_page' => '/productos',
                'first_seen_at' => now()->subDays(rand(1, 5)),
                'last_seen_at' => now()->subHours(rand(1, 12)),
            ]);

            $conv = WebConversation::create([
                'visitor_id' => $visitor->id,
                'widget_id' => $widget->id,
                'assigned_to' => $cd['status'] === 'active' ? $admin?->id : null,
                'status' => $cd['status'],
                'unread_count' => $cd['status'] === 'pending' ? $cd['messages'] : 0,
            ]);

            $visitorMessages = [
                'Hola, tengo una consulta sobre sus productos.',
                '¿Cuánto tiempo tarda el envío a Cochabamba?',
                'Gracias por la información.',
                'Me interesa el paquete premium.',
                '¿Tienen descuento por volumen?',
                'Voy a consultar con mi socio y te confirmo.',
                'Perfecto, muchas gracias.',
                'Una última pregunta, ¿aceptan transferencia?',
            ];

            $agentMessages = [
                '¡Hola! Claro, ¿en qué puedo ayudarte?',
                'El envío a Cochabamba tarda de 3 a 5 días hábiles.',
                'Sí, tenemos descuentos especiales para pedidos al por mayor.',
                'Te dejo el número de contacto para coordinar.',
                'Sí, aceptamos transferencia bancaria y depósito.',
                'Quedo atento a cualquier otra consulta.',
            ];

            $msgCount = $cd['messages'];
            for ($j = 0; $j < $msgCount; $j++) {
                $isVisitor = $j % 2 === 0;
                WebMessage::create([
                    'conversation_id' => $conv->id,
                    'content' => $isVisitor
                        ? $visitorMessages[$j % count($visitorMessages)]
                        : $agentMessages[$j % count($agentMessages)],
                    'is_from_visitor' => $isVisitor,
                    'created_at' => now()->subHours($msgCount - $j)->subMinutes(rand(0, 30)),
                ]);
            }

            $this->command->info("  Conversation {$conv->id}: {$cd['status']} - {$v['name']}");
        }

        $this->command->info('Web widget seeder finished.');
    }
}

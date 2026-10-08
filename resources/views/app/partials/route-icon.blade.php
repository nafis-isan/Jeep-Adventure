<svg class="route-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    @switch($icon)
        @case('target')
            <circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>
            @break
        @case('puzzle')
            <path d="M8 4.5a2.5 2.5 0 1 1 4.6 1.3H18a2 2 0 0 1 2 2v3.4a2.5 2.5 0 1 0 0 5V19a2 2 0 0 1-2 2h-3.5a2.5 2.5 0 1 0-5 0H6a2 2 0 0 1-2-2v-3.4a2.5 2.5 0 1 0 0-5V7a2 2 0 0 1 2-2h3.3A2.5 2.5 0 0 1 8 4.5Z"/>
            @break
        @case('water')
            <path d="M8 3.5S4.5 8 4.5 11a3.5 3.5 0 0 0 7 0C11.5 8 8 3.5 8 3.5Z"/><path d="M16.5 7s-3 3.8-3 6.5a3 3 0 0 0 6 0c0-2.7-3-6.5-3-6.5Z"/>
            @break
        @case('team')
            <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M16.5 10a2.5 2.5 0 1 0 0-5"/><path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V19Z"/><path d="M16 13a4 4 0 0 1 4 4v2h-3"/>
            @break
        @case('camera')
            <path d="M8.5 6 10 4h4l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/><circle cx="12" cy="12.5" r="3.5"/>
            @break
        @default
            <circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.4 5.2-5.2 2.4 2.4-5.2 5.2-2.4Z"/>
    @endswitch
</svg>

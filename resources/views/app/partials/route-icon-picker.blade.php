<fieldset class="route-icon-picker wide">
    <legend>Ikon Pos</legend>
    <div class="route-icon-options">
        @foreach(\App\Models\AdventureRoute::ICONS as $icon => $label)
            <label class="route-icon-option">
                <input type="radio" name="icon" value="{{ $icon }}" @checked($selectedIcon === $icon) required>
                <span class="route-icon-option-visual">
                    @include('app.partials.route-icon', ['icon' => $icon])
                </span>
                <small>{{ $label }}</small>
            </label>
        @endforeach
    </div>
</fieldset>

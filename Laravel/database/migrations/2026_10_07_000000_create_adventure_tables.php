<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('initials', 5);
            $table->string('motto');
            $table->string('status')->default('PENDING');
            $table->timestamps();
        });

        Schema::create('team_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('team_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('routes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedInteger('position')->unique();
            $table->string('name');
            $table->string('game_type');
            $table->text('description');
            $table->longText('instruction');
            $table->string('location');
            $table->unsignedInteger('duration');
            $table->unsignedInteger('max_points')->default(100);
            $table->string('difficulty');
            $table->string('color', 7)->default('#147b73');
            $table->timestamps();
        });

        Schema::create('check_ins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('team_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('route_id')->constrained('routes')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['team_id', 'route_id']);
        });

        Schema::create('scores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('team_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('route_id')->constrained('routes')->cascadeOnDelete();
            $table->unsignedInteger('points');
            $table->boolean('completed')->default(false);
            $table->text('note')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
            $table->unique(['team_id', 'route_id']);
        });

        Schema::create('experiences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('team_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('route_id')->constrained('routes')->cascadeOnDelete();
            $table->string('story', 280);
            $table->unsignedTinyInteger('rating');
            $table->string('media_path')->nullable();
            $table->string('media_type')->nullable();
            $table->timestamps();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experiences');
        Schema::dropIfExists('scores');
        Schema::dropIfExists('check_ins');
        Schema::dropIfExists('routes');
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('teams');
    }
};

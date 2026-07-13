<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Memastikan landing page dapat dibuka.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get(
            route(
                'landing_page',
                absolute: false
            )
        );

        $response->assertOk();
    }
}

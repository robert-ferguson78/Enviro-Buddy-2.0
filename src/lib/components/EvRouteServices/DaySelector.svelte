<script>
    import { routeStore } from '../../stores/routeStore.svelte.js';
    
    const days = [
        { id: 'monday', label: 'Monday' },
        { id: 'tuesday', label: 'Tuesday' },
        { id: 'wednesday', label: 'Wednesday' },
        { id: 'thursday', label: 'Thursday' },
        { id: 'friday', label: 'Friday' },
        { id: 'saturday', label: 'Saturday' },
        { id: 'sunday', label: 'Sunday' }
    ];
</script>

<div class="day-selector">
    {#each days as day}
        <button 
            class:active={routeStore.activeDay === day.id}
            style="--day-color: {routeStore.routes[day.id].color}"
            on:click={() => routeStore.activeDay = day.id}
        >
            {day.label}
        </button>
    {/each}
</div>

<style>
    .day-selector {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background: #f5f5f5;
        border-left: 4px solid var(--day-color);
    }
    
    button.active {
        background: var(--day-color);
        color: white;
    }
</style>

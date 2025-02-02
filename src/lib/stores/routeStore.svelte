<script module>
    import { ORSService } from '../routeServices/orsService';

    export function createRouteStore() {
        let route = $state(null);
        let loading = $state(false);
        let error = $state(null);
        let summary = $state(null);

        const orsService = new ORSService();

        const calculateRoute = async (waypoints) => {
            loading = true;
            error = null;

            try {
                const routeData = await orsService.getRoute(waypoints);
                route = routeData;
                summary = {
                    distance: routeData.features[0].properties.summary.distance,
                    duration: routeData.features[0].properties.summary.duration
                };
            } catch (err) {
                error = err.message;
                route = null;
                summary = null;
            } finally {
                loading = false;
            }
        };

        return {
            get route() { return route; },
            get loading() { return loading; },
            get error() { return error; },
            get summary() { return summary; },
            calculateRoute
        };
    }

    export const routeStore = createRouteStore();
</script>
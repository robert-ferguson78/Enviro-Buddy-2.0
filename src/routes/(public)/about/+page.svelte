<script context="module">
  // This function runs on the server before the page is sent to the client
  export async function load({ page, fetch, session }) {
      // The returned props are passed to the component
      return {
        props: {}
      };
    }
</script>

<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
</script>

<UpdateHead title="About Enviro-Buddy" description="Driving your Electric Dreams Today" />

<section class="section">
  <h1 class="title">Hello from ENVIRO-BUDDY</h1>
  <h2 class="subtitle">Driving Your Electric Dreams Today</h2>
<p>In an era where environmental consciousness is not just a choice but a necessity, transitioning towards more sustainable lifestyle choices has become imperative. Among the most impactful changes an individual can make is swapping a gasoline-powered vehicle for an electric one. The initiative by Enviro-Buddy to drive the electric dream today is not just about adopting new technology; it’s about committing to a greener, cleaner planet.</p>
</section>
<section class="section pt-1">
<h2 class="subtitle">Why the Switch to Electric Cars is Necessary</h2>

<p>The necessity for the switch to electric cars stems from several critical environmental, economic, and societal benefits. Here are the key factors driving this transition:<br/><br/></p>
<ol>
    <li>Reduced Emissions: Electric vehicles (EVs) emit no tailpipe pollutants, significantly reducing the amount of carbon dioxide and other harmful emissions released into the atmosphere. This is crucial in combating climate change and reducing air pollution, which poses health risks to millions worldwide.</li>
    <li>Sustainability: Electric cars offer a pathway to renewable energy adoption. Unlike fossil fuels, which are finite and environmentally damaging, electric cars can be powered by renewable sources such as solar, wind, and hydroelectric energy, aligning with global sustainability goals.</li>
    <li>Energy Efficiency: EVs are inherently more efficient than their internal combustion counterparts. Electric motors convert a higher percentage of electrical energy from the grid to power at the wheels, which means they use less energy to travel the same distance.</li>
    <li>Lower Operating Costs: Electric cars have fewer moving parts compared to traditional vehicles, resulting in lower maintenance costs. Additionally, electricity is cheaper than gasoline in many regions, making EVs more economical to operate over their lifespan.</li>
    <li>Innovation and Job Creation: The electric vehicle industry drives innovation in technology, from advancements in battery storage and energy efficiency to autonomous driving features. This innovation not only leads to better products for consumers but also creates new jobs in manufacturing, engineering, and infrastructure development.</li>
    <li>Government Incentives: Many governments worldwide offer incentives to purchase electric vehicles, such as tax credits, rebates, and exemptions from certain fees. These incentives make EVs more accessible to a broader audience and demonstrate a commitment to transitioning away from fossil fuels.</li>
    <li>Consumer Demand: As awareness of environmental issues grows, so does consumer demand for sustainable products, including electric cars. People are increasingly seeking ways to reduce their carbon footprint, and driving an EV is a tangible way to contribute to environmental preservation.</li>
</ol>
<p>Enviro-Buddy's commitment to driving electric dreams today is more than just an advocacy for cleaner transportation; it's a call to action for everyone to play a part in securing a sustainable future. By choosing electric cars, individuals can contribute to a significant reduction in global carbon emissions, promote energy independence, and drive forward into a cleaner, greener world. The switch to electric vehicles is not just a trend; it's a vital step towards environmental stewardship and a testament to the power of collective action in combating climate change.</p>
</section>
<section class="section pt-1">
<h2 class="subtitle">EV data set attribution</h2>
<p>The EV (Electric Vehicle) data in this project was obtained from the Open <a href="https://github.com/KilowattApp/open-ev-data">Ev Data (https://github.com/KilowattApp/open-ev-data) project.</a></p>
</section>
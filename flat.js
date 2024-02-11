

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 860 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


const x = d3.scaleLinear()
    .domain([0, 1])
    .range([margin.left, width - margin.right])
    .nice();

const y = d3.scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top])
    .nice();

svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));
svg.append("g")
    .call(d3.axisLeft(y));


function dirichlet(alphas) {
    const gammas = alphas.map(a => d3.randomGamma(a, 1))
    return function () {
        const sampled = gammas.map(g => g())
        const sum = sampled.reduce((a, b) => a + b, 0)
        return sampled.map(s => s / sum)
    }
}



function ngon(n) {
    const verts = []
    for (let i = 0; i < n; i++) {
        verts.push([Math.cos(2 * Math.PI * i / n) / 2 + 0.5, Math.sin(2 * Math.PI * i / n) / 2 + 0.5])
    }
    return verts
}

// window.verts = ngon(7)
// window.verts = [[1, 0], [0, .5], [.5, 0]]
// window.verts = [[1, 0], [0, .2], [1, .2], [0, 0]]

window.verts = [[0, 0], [.45, .5], [.5, .52], [.55, .5], [1, 0]]

function set_ngon() {
    const n = Number(d3.select("#ngon").property("value"))
    window.verts = ngon(n)
    resample()

}


function sample_data() {
    const data = []
    const verts = window.verts
    draw_polygon(verts)
    const alpha = Number(d3.select("#alpha").property("value")) + Number(d3.select("#alpha-big").property("value"))
    const dist = dirichlet(verts.map(() => alpha))
    const n_samples = d3.select("#N_samples").property("value")
    for (let i = 0; i < n_samples; i++) {
        const weights = dist()
        let x = 0; let y = 0
        for (let j = 0; j < verts.length; j++) {
            x += verts[j][0] * weights[j]
            y += verts[j][1] * weights[j]
        }
        data.push([x, y])
    }
    return data
}

function draw_polygon(verts) {
    const path = d3.path()
    path.moveTo(x(verts[0][0]), y(verts[0][1]))
    for (let i = 1; i < verts.length; i++) {
        path.lineTo(x(verts[i][0]), y(verts[i][1]))
    }
    path.closePath()
    return svg.append("path")
        .classed("poly", true)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("opacity", 0.6)
}



function resample() {
    // update the span
    d3.select("#alpha_val").text((Number(d3.select("#alpha").property("value")) + Number(d3.select("#alpha-big").property("value"))).toFixed(2))
    svg.selectAll(".poly").remove()
    svg.selectAll(".dots").remove()

    const unit_square = draw_polygon([[0, 0], [0, 1], [1, 1], [1, 0]])
    unit_square.attr("stroke", "black").attr("stroke-width", 2).attr("stroke-dasharray", "5,5")

    plot(sample_data())
}
resample()

function plot(data) {

    // show the dots
    svg.append("g")
        .classed("dots", true)
        .selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .attr("r", 4)
        .attr("fill", "black")
        .attr("stroke", "none")
        .attr("opacity", 0.3)

}
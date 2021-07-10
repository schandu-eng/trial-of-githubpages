const projectName ='chroplath'

//Call of the database
const 	USEducationDataUrl = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json',
		USCountyDataUrl = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json'

//Declaration of the width
const width = 960,
	  height = 700;

//Add the SVG
var svg = d3.select('.container-05')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('class','graph');
//Add the tooltip
var tooltip = d3.select('.container-05')
				.append('div')
				.attr('id', 'tooltip')
				.style('opacity', '0');
//Add the title
d3.select('svg')
  .append('text')
  .text('United States Educational Attainment')
  .attr('class', 'title')
  .attr('x', width / 2)
  .attr('y', 30)
  .style('text-anchor', 'middle');
	
//Add the description
d3.select('svg')
  .append('text')
  .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)')
  .attr('id', 'description')
  .attr('x', width / 2)
  .attr('y', 50)
  .style('text-anchor', 'middle');

//Projection form the sphere to the plane : generate /render the path to a canvas
var path = d3.geoPath();

//Set up a paramaeter x for the legends
var x = d3.scaleLinear()
		  .domain([2.6, 75.1])
		  .rangeRound([600, 800]);

//Build the threshold scale with parameters of the data in 8 parts
var color = d3.scaleThreshold()
 				.domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
 				.range(d3.schemeBlues[9]);

//Add the legends to the svg
var g = svg.append('g')
		 .attr('class', 'key')
		 .attr('id', 'legend')
		 .attr('transform', 'translate(0, 60)');

g.selectAll('rect')
  .data(
    color.range().map(function (d) {
      d = color.invertExtent(d);
      if (d[0] === null) {
        d[0] = x.domain()[0];
      }
      if (d[1] === null) {
        d[1] = x.domain()[1];
      }
      return d;
    })
  )
  .enter()
  .append('rect')
  .attr('height', 8)
  .attr('x', function (d) {
    return x(d[0]);
  })
  .attr('width', function (d) {
    return x(d[1]) - x(d[0]);
  })
  .attr('fill', function (d) {
    return color(d[0]);
  });
g.append('text')
 .attr('x', x.range()[0])
 .attr('y', -6)
 .attr('class', 'caption')
 .style('text-anchor', 'start')
 .style('font-weight', 'bold');

g.call(
	d3.axisBottom(x)
	  .tickSize(13)
	  .tickFormat(function(x) {
	  	return Math.round(x) + '%';
	  })
	  .tickValues(color.domain())
  )
 .select('.domain')
 .remove();

//Define the actions to follow in order to print the datavizualisation
// 1 - Call of the first database
// 2 - Call of the second database
// 3 - stand by to use them
d3.queue()
  .defer(d3.json, USCountyDataUrl)
  .defer(d3.json, USEducationDataUrl)
  .await(ready);	

//Define the function ready 
function ready(error, us, education) {
	if (error) {
		throw error;
	}
	//Add the counties to the map
	svg
    .append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', function (d) {
      return d.id;
    })
    .attr('data-education', function (d) {
      var result = education.filter(function (obj) {
        return obj.fips === d.id;
      });
      if (result[0]) {
        return result[0].bachelorsOrHigher;
      }
      // could not find a matching fips id in the data
      console.log('could find data for: ', d.id);
      return 0;
    })
    .attr('fill', function (d) {
      var result = education.filter(function (obj) {
        return obj.fips === d.id;
      });
      if (result[0]) {
        return color(result[0].bachelorsOrHigher);
      }
      // could not find a matching fips id in the data
      return color(0);
    })
    .attr('d', path)
    .attr('transform', 'translate(0, 70)')
    .on('mouseover', function (d) {
      tooltip.style('opacity', 0.9);
      tooltip
        .html(function () {
          var result = education.filter(function (obj) {
            return obj.fips === d.id;
          });
          if (result[0]) {
            return (
              result[0]['area_name'] +
              ', ' +
              result[0]['state'] +
              ': ' +
              result[0].bachelorsOrHigher +
              '%'
            );
          }
          // could not find a matching fips id in the data
          return 0;
        })
        .attr('data-education', function () {
          var result = education.filter(function (obj) {
            return obj.fips === d.id;
          });
          if (result[0]) {
            return result[0].bachelorsOrHigher;
          }
          // could not find a matching fips id in the data
          return 0;
        })
        .style('left', d3.event.pageX - 150 + 'px')
        .style('top', d3.event.pageY + 'px');
    })
    .on('mouseout', function () {
      tooltip.style('opacity', 0);
    });

	svg.append('path')
		.datum(
			topojson.mesh(us, us.objects.states, function(a, b) {
				return a !== b;
			})
		)
		.attr('class', 'states')
		.attr('d', path);
}
VanillaTilt.init(document.querySelector(".container-05"), {
			max: 5,
			speed: 100,
			glare: true,
			"max-glare": 0.2,
		});
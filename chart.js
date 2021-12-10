async function drawChart() {
	// @ Data
	const data = await d3.json("./data.json");
	data.map((d) => {
		d.date = d.date !== "?" ? +d.date : "?";
		d.style = d.style === "Op Art" ? "Optical art" : d.style;
		d.style_n = [
			"Surrealism",
			"Realism",
			"Expressionism",
			"Cubism",
			"Optical art",
		].includes(d.style)
			? d.style
			: "Other";
	});
	// console.log(data);

	// @ Group data in 7 groups
	const dateGroup = d3.range(7).map(() => []);
	data.forEach((d) => {
		const date = d.date;
		if (date === "?") dateGroup[6].push(d);
		else if (date < 1918) dateGroup[0].push(d);
		else if (date < 1928) dateGroup[1].push(d);
		else if (date < 1938) dateGroup[2].push(d);
		else if (date < 1948) dateGroup[3].push(d);
		else if (date < 1958) dateGroup[4].push(d);
		else if (date < 1973) dateGroup[5].push(d);
	});
	console.log(dateGroup);

	// @ Set up colors to each style
	const colorScale = {
		"Optical art": "#ffc533",
		Surrealism: "#f25c3b",
		Expressionism: "#5991c2",
		Realism: "#55514e",
		Cubism: "#5aa459",
		Other: "#bdb7b7",
	};

	// @ Function for getting the position of each unit
	const getXY = (idx) => {
		let col;
		let row;
		let groupIdx;
		if (idx < 14) {
			col = 1;
			row = parseInt((idx % 24) / 3) + 1;
			groupIdx = idx;
		} else if (idx < 99) {
			groupIdx = idx - 14;
			col = 1 + parseInt(groupIdx / 24) + 1;
			row = parseInt((groupIdx % 24) / 3) + 1;
		} else if (idx < 273) {
			groupIdx = idx - 99;
			col = 5 + parseInt(groupIdx / 24) + 1;
			row = parseInt((groupIdx % 24) / 3) + 1;
		} else if (idx < 335) {
			groupIdx = idx - 273;
			col = 13 + parseInt(groupIdx / 24) + 1;
			row = parseInt((groupIdx % 24) / 3) + 1;
		} else if (idx < 416) {
			groupIdx = idx - 335;
			col = 16 + parseInt(groupIdx / 24) + 1;
			row = parseInt((groupIdx % 24) / 3) + 1;
		} else if (idx < 457) {
			groupIdx = idx - 416;
			col = 20 + parseInt(groupIdx / 24) + 1;
			row = parseInt((groupIdx % 24) / 3) + 1;
		} else {
			groupIdx = idx - 457;
			col = 22 + parseInt(groupIdx / 24) + 1;
			row = parseInt((groupIdx % 24) / 3) + 1;
		}
		return [groupIdx, col, row];
	};

	// @ Chart
	const cubeWidth = 32;
	const svg = d3.select("#chart");
	const bounds = svg.append("g"); // for all information
	const artworkGroup = bounds
		.append("g") // for chart only
		.attr("class", "main-chart")
		.attr("transform", `scale(1.10)`);

	function drawArtwork() {
		const artworks = artworkGroup
			.selectAll("use.artwork")
			.data(data)
			.join("use")
			.attr("class", "artwork")
			.attr("xlink:href", (d, i) =>
				getXY(i)[0] % 3 === 0 // groupIdx
					? "#unit-0"
					: getXY(i)[0] % 3 === 1
					? "#unit-1"
					: "#unit-2"
			)
			.attr("fill", (d) => colorScale[d.style_n])
			.attr("stroke", "white")
			.attr("data-index", (d) => d.style_n)
			.attr("id", (d, i) => i)
			// 40 cubeWidth=40  x -150 // y 70+
			// 36 cubeWidth=36  x -80 // y 110+
			.attr("x", (d, i) => getXY(i)[1] * 1.5 * cubeWidth - 80) // column #
			.attr(
				"y",
				(d, i) =>
					110 +
					getXY(i)[2] * 1.5 * cubeWidth + // row #
					(getXY(i)[1] % 2 === 0 ? 0 : 0.75 * cubeWidth) // 错开奇数列和偶数列
			);
	}
	drawArtwork();

	// @ Blank Artworks
	const drawBlankArtwork = () => {
		// bottom odd 9 / even 10
		const rawMax = [
			5, 8, 8, 8, 5, 8, 8, 8, 8, 8, 8, 8, 2, 8, 8, 5, 8, 8, 8, 3, 8, 6, 5,
		]; // 数字代表各列中有多少行被填充过
		// console.log(rawMax.length); // 23
		// there are 23 columns in the chart
		// there are 10 rows in the chart
		const blank = [];
		d3.range(1, 24).map((d) => {
			// ~ return the position of blank cube
			// top odd 0/-1 / even 0
			d % 2 === 0
				? blank.push({ x: d, y: 0 }) // 1st blank
				: blank.push({ x: d, y: 0 }, { x: d, y: -1 }); // 1st blank and the one above
			// bottom odd 9 / even 10
			if (d % 2 === 0) {
				for (let i = rawMax[d - 1] + 1; i <= 10; i++)
					blank.push({ x: d, y: i });
			} else {
				for (let i = rawMax[d - 1] + 1; i <= 9; i++) blank.push({ x: d, y: i });
			}
		});
		// console.log(blank);

		let blankData = [];
		blank.map((d) => {
			// repeat 3 times ~ 因为一个cube包含3个unit，所以重复3次
			d3.range(3).map(() => blankData.push({ x: d.x, y: d.y }));
		});
		// console.log(blankData);
		const specialBlank = [
			{ x: 1, y: 5, unit: 2 },
			{ x: 5, y: 5, unit: 1 },
			{ x: 5, y: 5, unit: 2 },
			{ x: 16, y: 5, unit: 2 },
			{ x: 22, y: 6, unit: 2 },
			{ x: 23, y: 5, unit: 1 },
			{ x: 23, y: 5, unit: 2 },
		];
		blankData = [...blankData, ...specialBlank];
		// console.log(blankData);

		const blankArtworks = artworkGroup
			.selectAll("use.blank")
			.data(blankData)
			.join("use")
			.attr("class", "blank")
			.attr(
				"xlink:href", // 引入到unit
				(d, i) =>
					d.unit
						? `#unit-${d.unit}`
						: i % 3 === 0
						? "#unit-0"
						: i % 3 === 1
						? "#unit-1"
						: "#unit-2"
			)
			.attr("fill", "#f2f2e8")
			.attr("stroke", "white")
			.attr("stroke-width", 1)
			.attr("x", (d) => d.x * 1.5 * cubeWidth - 80)
			.attr(
				"y",
				(d) =>
					110 + d.y * 1.5 * cubeWidth + (d.x % 2 === 0 ? 0 : 0.75 * cubeWidth)
			);
	};
	drawBlankArtwork();

	// @ Tooltip
	const tooltip = d3.select("#tooltip");
	svg.on("click", onSvgClick);

	d3.selectAll("use.artwork").on("click", showTooltip);
	// .on("mouseleave", onMouseLeave);

	function showTooltip(datum) {
		console.log(datum.target.__data__);
		tooltip.style("opacity", 1);
		tooltip.select("#title").text(datum.target.__data__.title);
		tooltip
			.select("#date")
			.text(
				datum.target.__data__.date !== "?"
					? datum.target.__data__.date
					: "Year Unknown"
			);
		tooltip.select("#style").text(datum.target.__data__.style);
		tooltip.select("#genre").text(datum.target.__data__.genre);
		tooltip.select("#image img").attr("src", datum.target.__data__.img);
		tooltip.select("#url a").attr("href", datum.target.__data__.url);

		let [x, y] = d3.pointer(event, this);
		// console.log(x, y);
		x = x > 700 ? x - 300 : x;
		y = y > 450 ? y - 300 : y;
		tooltip.style("left", `${x + 100}px`).style("top", `${y + 50}px`);

		event.stopPropagation();
		// be used to stop an event from propagating up the DOM tree
		// http://bl.ocks.org/jasondavies/3186840
	}

	function onSvgClick() {
		tooltip.style("opacity", 0);
		tooltip.style("left", "1000px").style("top", "500px");
	}

	function onMouseLeave() {
		tooltip.style("opacity", 0);
	}

	// @ Date
	const drawDateInfo = () => {
		const dateText = [
			{ col: 1, shortLine: false, age: "年龄<20", range: "1898-" },
			{ col: 2, shortLine: true, age: "20-29", range: "1918-1927" },
			{ col: 6, shortLine: true, age: "30-39", range: "1928-1937" },
			{ col: 14, shortLine: true, age: "40-49", range: "1938-1947" },
			{ col: 17, shortLine: false, age: "50-59", range: "1948-1957" },
			{ col: 21, shortLine: false, age: "60-69", range: "1958-1972" },
			{ col: 23, shortLine: false, age: "", range: "未知年份" },
		];
		const dateTextGroup = artworkGroup.selectAll("g").data(dateText).join("g");

		dateTextGroup
			.append("text")
			.text((d) => d.age)
			.style("text-anchor", "middle")
			.attr("x", (d, i) => d.col * 1.5 * cubeWidth + 63)
			.attr("y", 195)
			.attr("font-size", 13);

		dateTextGroup
			.append("text")
			.text((d) => d.range)
			.style("text-anchor", "middle")
			.attr("x", (d, i) => d.col * 1.5 * cubeWidth + 63)
			.attr("y", 210)
			.attr("fill", "grey")
			.attr("font-size", 11);

		dateTextGroup
			.append("line")
			.attr("x1", (d, i) => d.col * 1.5 * cubeWidth + 63)
			.attr("x2", (d, i) => d.col * 1.5 * cubeWidth + 63)
			.attr("y1", 215)
			.attr("y2", (d) => (d.shortLine ? 246 : 270))
			.attr("stroke", "#2980b9")
			.attr("stroke-dasharray", "5px 1px");
	};
	drawDateInfo();

	// @ Title & Image
	function drawTitleImage() {
		// title
		const title = bounds
			.append("text")
			.text("埃舍尔的画廊")
			.attr("x", 90)
			.attr("y", 90)
			.attr("text-anchor", "start")
			.attr("font-size", 40)
			.attr("font-weight", "bold");

		const subTitle = bounds.append("g").attr("class", "sub-title");
		subTitle
			.append("text")
			.text("一位荷兰画家的470幅作品")
			.attr("x", 110)
			.attr("y", 125)
			.attr("font-size", 16);
		subTitle
			.append("text")
			.text("(-: 点击图案会出现更详细的信息 :-)")
			.attr("x", 115)
			.attr("y", 150)
			.attr("fill", "#e6a532")
			.attr("font-size", 12);
		subTitle
			.append("a")
			.attr("href", "https://en.wikipedia.org/wiki/M._C._Escher")
			.attr("target", "_blank")
			.append("text")
			.text("M.C.埃舍尔(1898-1972)")
			.attr("x", 500)
			.attr("y", 150)
			.attr("fill", "#5991c2")
			.attr("font-size", 16);

		const image = bounds.append("g").attr("class", "photo");
		var defsImg = image.append("defs");
		var filter = defsImg.append("filter").attr("id", "drop-shadow");
		filter
			.append("feGaussianBlur")
			.attr("in", "SourceAlpha")
			.attr("stdDeviation", 6)
			.attr("result", "blur");
		filter
			.append("feOffset")
			.attr("in", "blur")
			.attr("dx", 2)
			.attr("dy", 2)
			.attr("result", "offsetBlur");
		var feMerge = filter.append("feMerge");
		feMerge.append("feMergeNode").attr("in", "offsetBlur");
		feMerge.append("feMergeNode").attr("in", "SourceGraphic");
		const imgEschers = image
			.append("image")
			.attr("xlink:href", "./Escher.jpg")
			.attr("width", 200)
			.attr("height", 120)
			.attr("x", 310)
			.attr("y", 40)
			.style("filter", "url(#drop-shadow)");
	}
	drawTitleImage();

	// Unit Example
	const drawAnno = () => {
		const anno = bounds.append("g").attr("transform", "translate(600, 25)");
		const annoArtwork = anno
			.append("use")
			.attr("xlink:href", "#unit-0")
			.attr("fill", "#F25B3B")
			.attr("x", 120)
			.attr("y", -30);

		const annoText = anno
			.append("text")
			.text("作品样例~可点击")
			.attr("x", 210)
			.attr("y", 100)
			.attr("fill", "grey")
			.attr("font-size", 13);
	};
	drawAnno();

	// @ Legend
	const styleCountMap = d3.rollup(
		data,
		(v) => v.length,
		(d) => d.style_n
	);
	console.log("styleCount:", styleCountMap);
	const styleCount = [];
	for (const [style, count] of styleCountMap) {
		styleCount.push({ style, count });
	}

	styleCount.forEach((d) => {
		const style = d.style;
		if (style === "Optical art") d.style_cn = "视幻艺术";
		else if (style === "Surrealism") d.style_cn = "超现实主义";
		else if (style === "Expressionism") d.style_cn = "表现主义";
		else if (style === "Realism") d.style_cn = "现实主义";
		else if (style === "Cubism") d.style_cn = "立体主义";
		else if (style === "Other") d.style_cn = "其它形式";
	});
	console.log(styleCount);

	// Bar chart for Styles_Count
	const drawStyleLegend = () => {
		const countScale = d3
			.scaleLinear()
			.domain([0, d3.max(styleCount, (d) => d.count)])
			.range([0, 200]);

		const legend = bounds.append("g").attr("transform", "translate(960, 40)");

		const legendTitle = legend
			.append("text")
			.text("各艺术品风格对应的数量")
			.attr("x", 60)
			.attr("y", 10)
			.attr("font-size", 17);

		const legendGroup = legend
			.selectAll("g")
			.data(styleCount.sort((a, b) => b.count - a.count))
			.join("g")
			.attr("transform", (d, i) => `translate(110, ${28 + 18 * i})`);

		const lengedStyleText = legendGroup
			.append("text")
			.text((d) => d.style_cn) // this style_n
			.attr("x", -90)
			.attr("y", 6)
			.attr("text-anchor", "start")
			.attr("fill", "#656565")
			.attr("font-size", 15);

		const lengedRect = legendGroup
			.append("rect")
			.attr("width", (d) => countScale(d.count))
			.attr("height", 12)
			.attr("fill", (d) => colorScale[d.style]);

		const lengedStyleCountText = legendGroup
			.append("text")
			.text((d) => d.count)
			.attr("x", (d) => countScale(d.count) + 10)
			.attr("y", 8)
			.attr("fill", (d) => colorScale[d.style])
			.attr("font-size", 13);
	};
	drawStyleLegend();

	// @ Data source & Author
	function drawDesc() {
		const descLeft = artworkGroup.append("g").attr("class", "desc-left");

		descLeft
			.append("text")
			.text("数据来源: ")
			.attr("x", 150)
			.attr("y", 680)
			.attr("font-size", 12);

		descLeft
			.append("a")
			.attr("href", "https://www.wikiart.org/en/m-c-escher")
			.attr("target", "_blank")
			.append("text")
			.text("https://www.wikiart.org/en/m-c-escher")
			.attr("x", 210)
			.attr("y", 680)
			.attr("fill", "#5991c2")
			.attr("font-size", 12);

		const descRight = artworkGroup.append("g").attr("class", "desc-right");

		descRight
			.append("text")
			.text(
				"作品来源1: Tableau | Wendy Shijia | @ShijiaWendy | 24 August 2020 | "
			)
			.attr("x", 604)
			.attr("y", 670)
			.attr("font-size", 12);

		descRight
			.append("a")
			.attr(
				"href",
				"https://public.tableau.com/profile/wendy.shijia#!/vizhome/MCEschersGallery_15982882031370/Gallery"
			)
			.attr("target", "_blank")
			.append("text")
			.text("Tableau: Wendy Shijia/Escher's Gallery")
			.attr("x", 970)
			.attr("y", 670)
			.attr("fill", "#5991c2")
			.attr("font-size", 12);

		descRight
			.append("text")
			.text("作品来源2: D3.js | 古柳Guliu | @Deserts_X | 22 October 2020 | ")
			.attr("x", 604)
			.attr("y", 690)
			.attr("font-size", 12);

		descRight
			.append("a")
			.attr("href", "https://github.com/DesertsX/dataviz-in-action")
			.attr("target", "_blank")
			.append("text")
			.text("GitHub: DesertsX/dataviz-in-action")
			.attr("x", 970)
			.attr("y", 690)
			.attr("fill", "#5991c2")
			.attr("font-size", 12);

		descRight
			.append("text")
			.text("本次复现: Max Shuangxu | December 2021")
			.attr("x", 950)
			.attr("y", 735)
			.attr("font-size", 12);
	}
	drawDesc();
}

drawChart();

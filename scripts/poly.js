import fs from "fs";
import path from "path";
import chalk from "chalk";
import { program } from "commander";

const DEFAULT_CONFIG = {
	width: 500,
	height: 500,
	shapes: 7,
	output: "./output",
	files: 1,
};

const randomInt = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min;
const randomColor = () =>
	"#" + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, "0");
const randomOpacity = () => (Math.random() * 0.7 + 0.3).toFixed(2);

const shapes = {
	circle: (width, height) => {
		const radius = randomInt(10, Math.min(width, height) / 3);
		return `
	<circle 
	  cx="${randomInt(radius, width - radius)}" 
	  cy="${randomInt(radius, height - radius)}" 
	  r="${radius}" 
	  fill="${randomColor()}"
	  opacity="${randomOpacity()}"
	  stroke="${randomColor()}"
	  stroke-width="${randomInt(0, 4)}"
	/>`;
	},

	rect: (width, height) => {
		const w = randomInt(20, width / 2);
		const h = randomInt(20, height / 2);
		return `
	<rect 
	  x="${randomInt(0, width - w)}" 
	  y="${randomInt(0, height - h)}" 
	  width="${w}" 
	  height="${h}" 
	  fill="${randomColor()}" 
	  stroke="${randomColor()}"
	  stroke-width="${randomInt(0, 4)}"
	  opacity="${randomOpacity()}"
	  rx="${randomInt(0, 20)}"
	/>`;
	},

	polygon: (width, height) => {
		const sides = randomInt(3, 8);
		const radius = randomInt(10, Math.min(width, height) / 3);
		const centerX = randomInt(radius, width - radius);
		const centerY = randomInt(radius, height - radius);

		let points = "";
		for (let i = 0; i < sides; i++) {
			const angle =
				(i * 2 * Math.PI) / sides + (Math.random() * 0.5 - 0.25);
			const x = centerX + radius * Math.cos(angle);
			const y = centerY + radius * Math.sin(angle);
			points += `${x},${y} `;
		}

		return `
	<polygon 
	  points="${points.trim()}" 
	  fill="${randomColor()}" 
	  opacity="${randomOpacity()}"
	/>`;
	},

	path: (width, height) => {
		const segments = randomInt(1, 3);
		let d = `M ${randomInt(0, width)} ${randomInt(0, height)}`;

		for (let i = 0; i < segments; i++) {
			d +=
				` C ` +
				` ${randomInt(0, width)} ${randomInt(0, height)}`.repeat(3);
		}

		return `
	<path 
	  d="${d} Z" 
	  stroke="${randomColor()}" 
	  fill="none" 
	  stroke-width="${randomInt(1, 5)}"
	  opacity="${randomOpacity()}"
	/>`;
	},
};

function generateSVG(config) {
	const { width, height, shapes: shapeCount } = config;
	const shapeTypes = Object.keys(shapes);
	let svgShapes = "";

	for (let i = 0; i < shapeCount; i++) {
		const shapeType = shapeTypes[randomInt(0, shapeTypes.length - 1)];
		console.log(shapeType);
		svgShapes += shapes[shapeType](width, height);
	}

	return `
		<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  		<rect width="100%" height="100%" fill="${randomColor()}" />
 		 ${svgShapes}
		</svg>`.trim();
}

function runGenerator() {
	program
		.option(
			"-w, --width <number>",
			"SVG width",
			Number,
			DEFAULT_CONFIG.width
		)
		.option(
			"-h, --height <number>",
			"SVG height",
			Number,
			DEFAULT_CONFIG.height
		)
		.option(
			"-s, --shapes <number>",
			"Number of shapes per SVG",
			Number,
			DEFAULT_CONFIG.shapes
		)
		.option(
			"-f, --files <number>",
			"Number of files to generate",
			Number,
			DEFAULT_CONFIG.files
		)
		.option(
			"-o, --output <path>",
			"Output directory",
			DEFAULT_CONFIG.output
		)
		.parse(process.argv);

	const options = program.opts();
	const config = { ...DEFAULT_CONFIG, ...options };

	try {
		if (!fs.existsSync(config.output)) {
			fs.mkdirSync(config.output, { recursive: true });
			console.log(
				chalk.green(`Created output directory: ${config.output}`)
			);
		}

		for (let i = 1; i <= config.files; i++) {
			const svgContent = generateSVG(config);
			const filename = path.join(config.output, `random-poly-${i}.svg`);
			fs.writeFileSync(filename, svgContent);
			console.log(chalk.blue(`Generated ${filename}`));
		}

		console.log(
			chalk.green.bold(
				`\nSuccessfully generated ${config.files} SVG files!`
			)
		);
	} catch (error) {
		console.error(chalk.red("Error:"), error.message);
		process.exit(1);
	}
}

runGenerator();

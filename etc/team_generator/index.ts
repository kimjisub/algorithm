import { peopleData } from './peopleData';

interface Person {
	name: string;
	links: string[];
	gender: string;
	dodgeball: boolean;
}

function ensureBidirectionalLinks(people: Person[]): void {
	for (const person of people) {
		for (const link of person.links) {
			let linkedPerson = people.find((p) => p.name === link);
			if (!linkedPerson) {
				linkedPerson = {
					name: link,
					links: [],
					gender: 'unknown',
					dodgeball: false,
				};
				people.push(linkedPerson);
			}
			if (!linkedPerson.links.includes(person.name)) {
				linkedPerson.links.push(person.name);
			}
		}
	}
}

function shuffleArray<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

function chunkArray<T>(array: T[], groupCount: number): T[][] {
	const results: T[][] = [];
	const baseChunkSize = Math.floor(array.length / groupCount);
	const remainder = array.length % groupCount;

	let currentIndex = 0;
	for (let i = 0; i < groupCount; i++) {
		const chunkSize = baseChunkSize + (i < remainder ? 1 : 0);
		results.push(array.slice(currentIndex, currentIndex + chunkSize));
		currentIndex += chunkSize;
	}

	return results;
}

function scoreGroup(groups: Person[][]) {
	let links: string[][] = [];
	for (const group of groups) {
		for (const person of group) {
			const personLinks = person.links
				.filter((link) => group.find((p) => p.name === link))
				.map((p) => [person.name, p]);
			links = [...links, ...personLinks];
		}
	}

	// reduce fliped links
	links = links.filter(([p1, p2]) => p1 < p2);

	return { score: links.length, links: links };
}

function isBalanced(teams: Person[][]): boolean {
	const minMax = {
		m: { min: Infinity, max: 0 },
		f: { min: Infinity, max: 0 },
		dodgeballTrue: { min: Infinity, max: 0 },
		dodgeballFalse: { min: Infinity, max: 0 },
	};

	for (const team of teams) {
		const stats = {
			m: team.filter((p) => p.gender === 'm').length,
			f: team.filter((p) => p.gender === 'f').length,
			dodgeballTrue: team.filter((p) => p.dodgeball).length,
			dodgeballFalse: team.filter((p) => !p.dodgeball).length,
		};

		for (const untypedKey in minMax) {
			const key = untypedKey as keyof typeof minMax;
			minMax[key].min = Math.min(minMax[key].min, stats[key]);
			minMax[key].max = Math.max(minMax[key].max, stats[key]);
		}
	}

	for (const untypedKey in minMax) {
		const key = untypedKey as keyof typeof minMax;
		if (minMax[key].max - minMax[key].min > 1) {
			return false;
		}
	}

	return true;
}

function teamWithName(teams: Person[][]) {
	return teams.map((team) => team.map((person) => person.name));
}

function randomTeams(people: Person[], groupCount: number) {
	// 조합 생성
	let teams: Person[][] = [];
	while (true) {
		teams = chunkArray(shuffleArray(people), groupCount);
		if (isBalanced(teams)) {
			break;
		}
	}

	// 각 조합의 스코어 계산
	const { score, links } = scoreGroup(teams);

	return {
		teams,
		score,
		links,
	};
}

const people: Person[] = [...peopleData];

console.log(people.length);

ensureBidirectionalLinks(people);
// console.log(people);

const best: { score: number; teams: Person[][]; links: string[][] } = {
	score: Infinity,
	teams: [],
	links: [],
};

for (let i = 0; ; i++) {
	const { score, teams, links } = randomTeams(people, 4);
	if (score <= best.score) {
		best.score = score;
		best.teams = teams;
		best.links = links;
		console.log(i, best.score);
		console.log(best.teams);
		console.log(
			best.teams.map((team) => team.map((person) => person.name)).join('\n')
		);
		console.log(best.links.map((link) => link.join(' <-> ')).join('\n'));
	}
}

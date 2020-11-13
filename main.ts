// Part 1

// Given string with format "Student1 - Group1; Student2 - Group2; ..."

const studentsStr: string = "Бортнік Василь - ІВ-72; " +
    "Чередніченко Владислав - ІВ-73; " +
    "Гуменюк Олександр - ІВ-71; " +
    "Корнійчук Ольга - ІВ-71; " +
    "Киба Олег - ІВ-72; " +
    "Капінус Артем - ІВ-73; " +
    "Овчарова Юстіна - ІВ-72; " +
    "Науменко Павло - ІВ-73; " +
    "Трудов Антон - ІВ-71; " +
    "Музика Олександр - ІВ-71; " +
    "Давиденко Костянтин - ІВ-73; " +
    "Андрющенко Данило - ІВ-71; " +
    "Тимко Андрій - ІВ-72; " +
    "Феофанов Іван - ІВ-71; " +
    "Гончар Юрій - ІВ-73";

// Task 1
// Create dictionary:
// - key is a group name
// - value is sorted array with students
interface StudentGroups {
    [key: string]: string[]
}

const studentsGroups: StudentGroups = {};
for (const studentRow of studentsStr.split("; ")){
    const [student, group] = studentRow.split(" - ");
    if (!Object.keys(studentsGroups).includes(group)){
        studentsGroups[group] = [];
    }
    studentsGroups[group].push(student);
}

Object.values(studentsGroups).forEach((studentsArray: string[]) => studentsArray.sort());

console.log('First task result:');
console.dir(studentsGroups);

const points: number[] = [5, 8, 15, 15, 13, 10, 10, 10, 15]
// Task 2
// Create dictionary:
// - key is a group name
// - value is dictionary:
//   - key is student
//   - value is array with points (fill it with random values, use function `randomValue(maxValue: Int) -> Int` )

const arc4random_uniform = (max: number): number => {
    return Math.floor(Math.random() * Math.floor(max));
};

const randomValue = (maxValue: number): number => {
    switch (arc4random_uniform(6)) {
        case 1: return Math.ceil(maxValue * 0.7);
        case 2: return Math.ceil(maxValue * 0.9);
        case 3:
        case 4:
        case 5:
            return maxValue;
        default:
            return 0;
    }
};

interface StudentPoints {
    [student: string]: number[]
}

const studentPoints: {[group: string]: StudentPoints} = {};
for (const group of Object.keys(studentsGroups)){
    const groupDict: StudentPoints = {};
    for (const student of studentsGroups[group]){
        groupDict[student] = points.map(value => randomValue(value));
    }
    studentPoints[group] = groupDict;
}

console.log('Second task result:');
console.log(studentPoints);

// Task 3
// Create dictionary:
// - key is a group name
// - value is dictionary:
//   - key is student
//   - value is sum of student's points
interface SumPoints {
    [student: string]: number
}

const sumPoints: {[group: string]: SumPoints} = {};
for (const group of Object.keys(studentPoints)){
    const groupDict: SumPoints = {};
    for (const student of Object.keys(studentPoints[group])){
        groupDict[student] = studentPoints[group][student]
            .reduce(((previousValue, currentValue) => currentValue + previousValue), 0);
    }
    sumPoints[group] = groupDict;
}
console.log('Third task result:');
console.dir(sumPoints);


// Task 4
// Create dictionary:
// - key is group name
// - value is average of all students points
const groupAvg: {[group: string]: number} = {};
for (const group of Object.keys(sumPoints)){
    const sum: number = Object.values(sumPoints[group])
        .reduce(((previousValue, currentValue) => currentValue + previousValue), 0);
    const count = Object.keys(sumPoints[group]).length;
    groupAvg[group] = sum / count;
}
console.log('Task 4 result:');
console.dir(groupAvg);

// Task 5
// Create dictionary:
// - key is group name
// - value is array of students that have >= 60 points

const passedPerGroup = {};
for (const group of Object.keys(sumPoints)){
    passedPerGroup[group] = Object.keys(sumPoints[group])
        .filter(student => sumPoints[group][student] >= 60);
}

console.log('Task 5 result:');
console.dir(passedPerGroup);

// Part 2
enum Zone {
    North = 'N',
    South = 'S',
    East = 'E',
    West = 'W'
}

enum Direction {
    latitude,
    longitude,
}


// Kostya Furman => KF
class CoordinateKF {
    private readonly _direction: Direction;
    private readonly _degrees: bigint;
    private readonly _minutes: bigint;
    private readonly _seconds: bigint;
    private readonly _zone: Zone;
    private readonly _point: number;

    private readonly MIN_LAT_DEGREES: bigint = BigInt(-90);
    private readonly MAX_LAT_DEGREES: bigint = BigInt(91);
    private readonly MIN_LON_DEGREES: bigint = BigInt(-180);
    private readonly MAX_LON_DEGREES: bigint = BigInt(181);

    private readonly MIN_MINUTES: bigint = BigInt(0);
    private readonly MAX_MINUTES: bigint = BigInt(60);

    private readonly MIN_SECONDS: bigint = BigInt(0);
    private readonly MAX_SECONDS: bigint = BigInt(60);

    constructor(direction: Direction);
    constructor(
        direction: Direction,
        degrees?: bigint,
        minutes?: bigint,
        seconds?: bigint,
    );
    constructor(direction: Direction, ...coordinate: any) {
        const [d, m, s] = coordinate;
        const degrees: bigint = d || BigInt(0);
        const minutes: bigint = m || BigInt(0);
        const seconds: bigint = s || BigInt(0);

        this._direction = direction;
        this._degrees = this._direction === Direction.latitude ?
            CoordinateKF._validate(degrees , this.MIN_LAT_DEGREES, this.MAX_LAT_DEGREES) :
            CoordinateKF._validate(degrees , this.MIN_LON_DEGREES, this.MAX_LON_DEGREES);
        this._minutes = CoordinateKF._validate(minutes, this.MIN_MINUTES, this.MAX_MINUTES);
        this._seconds = CoordinateKF._validate(seconds, this.MIN_SECONDS, this.MAX_SECONDS);
        this._zone = CoordinateKF._getZone(direction, degrees);
        this._point = CoordinateKF._calculatePoint(degrees, minutes, seconds);
    }

    private static _validate(value: bigint, min: bigint, max: bigint) {
        if (value < max && value >= min) {
            return value;
        }
        throw new RangeError(`Value ${value} doesn't between ${min} and ${max}!`)
    }

    private static _getZone(direction: Direction, degrees: bigint): Zone {
        const lat: Zone[] = [Zone.East, Zone.West];
        const lot: Zone[] = [Zone.North, Zone.South];
        const zones: Zone[] = direction === Direction.latitude ? lat : lot;
        return degrees > 0 ? zones[0] : zones[1];
    }

    private static _calculatePoint(degrees: bigint, minutes: bigint, seconds: bigint): number {
        return Number(degrees) + (Number(minutes)/60) + (Number(seconds)/3600);
    }

    static fromZeros(direction: Direction): CoordinateKF {
        return new CoordinateKF(direction, BigInt(0), BigInt(0), BigInt(0));
    }

    get direction() : Direction {
        return this._direction;
    }

    public toString(): string {
        return `${this._degrees}°${this._minutes}′${this._seconds}″ ${this._zone}`;
    }

    public toDigitString(): string {
        return `${this._point}° ${this._zone}`;
    }

    public midpoint(coordinate: CoordinateKF): CoordinateKF | null {
        if (this._direction !== coordinate.direction) {
            return null;
        }
        const direction: Direction = this._direction;
        const degrees: bigint = BigInt(Number(this._degrees + coordinate._degrees)/2);
        const minutes: bigint = BigInt(Number(this._minutes + coordinate._minutes)/2);
        const seconds: bigint = BigInt(Number(this._seconds + coordinate._seconds)/2);
        return new CoordinateKF(direction, degrees, minutes, seconds);
    }

    static middlePoint(c1: CoordinateKF, c2: CoordinateKF): CoordinateKF | null {
        return c1.midpoint(c2);
    }
}

const coord1 = new CoordinateKF(Direction.latitude);
const coord2 = new CoordinateKF(Direction.latitude, BigInt(10), BigInt(10), BigInt(10));

console.log(coord1.toString());
console.log(coord2.toDigitString());

const coordmid1 = coord2.midpoint(coord1);
console.log(coordmid1.toString());
console.log(coordmid1.toDigitString());

const coordmid2 = CoordinateKF.middlePoint(coord2, coord1);
console.log(coordmid2.toString());
console.log(coordmid2.toDigitString());
import Candy from "./Candy";

export default class MainSceneControl extends Laya.Script {
    /** @prop {name:candy, tips:"糖果", type:Prefab}*/
    public candy: Laya.Prefab;
    /** @prop {name:candyParent, tips:"糖果父节点", type:Node}*/
    public candyParent: Laya.Sprite;

    /** @prop {name:bucket, tips:"盒子", type:Prefab}*/
    public bucket: Laya.Prefab;
    /** @prop {name:bucketParent, tips:"盒子父节点", type:Node}*/
    public bucketParent: Laya.Sprite;

    /** @prop {name:enemy, tips:"敌人", type:Prefab}*/
    public enemy: Laya.Prefab;
    /** @prop {name:enemyParent, tips:"敌人父节点", type:Prefab}*/
    public enemyParent: Laya.Prefab;


    /** @prop {name:background, tips:"背景图", type:Node}*/
    public background: Laya.Sprite;
    /** @prop {name:assembly, tips:流水线, type:Node}*/
    public assembly: Laya.Sprite;

    /** @prop {name:scoreLabel, tips:‘得分’, type:Node}*/
    public scoreLabel: Laya.Label;

    /**敌人出现开关，这个开关每次开启后，立马会被关闭，因为每次只出现一个敌人*/
    private enemyAppear: boolean;
    /**糖果产生的时间间隔*/
    private candy_interval: number;
    /**当前时间记录*/
    private creatTime: number;
    /**生产开关*/
    private creatOnOff: boolean;
    /**糖果到碰到感应装置时，名字装进这个数组*/
    private nameAndIndex: Array<string>;
    /**生成糖果个数计数器*/
    private candyCount: number;

    constructor() { super(); }

    onEnable(): void {
        this.initSecne();
    }

    /**场景初始化*/
    initSecne(): void {
        this.enemyAppear = false;
        this.candy_interval = 500;
        this.creatTime = Date.now();
        this.creatOnOff = true;
        Laya.MouseManager.multiTouchEnabled = true;
        this.nameAndIndex = [];
        this.candyCount = 0;
        this.scoreLabel.text = '0';
        this.bucketInit();
    }

    /**糖果桶初始化,他们位置不一样，并且成对出现*/
    bucketInit(): void {
        // 第一个桶的位置
        let x_01: number = Laya.stage.width * 1 / 4;
        let y_01 = 800;
        let imageUrl_01: string = 'candy/红色桶.png';
        // 第二个桶的位置
        let x_02: number = Laya.stage.width * 3 / 4;
        let y_02 = 800;
        let imageUrl_02: string = 'candy/黄色桶.png';

        for (let i = 0; i < 2; i++) {
            let bucket = Laya.Pool.getItemByCreateFun('bucket', this.bucket.create, this.bucket) as Laya.Sprite;
            this.bucketParent.addChild(bucket);
            switch (i) {
                case 0:
                    bucket.name = 'redBucket';
                    bucket.pos(x_01 - bucket.width / 2, y_01);
                    (bucket.getChildByName('pic') as Laya.Sprite).loadImage(imageUrl_01);
                    break;
                case 1:
                    bucket.name = 'yellowBucket';
                    bucket.pos(x_02 - bucket.width / 2, y_02);
                    (bucket.getChildByName('pic') as Laya.Sprite).loadImage(imageUrl_02);
                    break;
            }
        }
    }

    /**产生糖果*/
    productionCandy(): void {
        let candy = Laya.Pool.getItemByCreateFun('candy', this.candy.create, this.candy) as Laya.Sprite;
        this.candyCount++;

        // 随机创建一种颜色糖果
        // 糖果的名称结构是11位字符串加上索引值，这样使他们的名称唯一
        let randomNum = Math.floor(Math.random() * 2);
        let url_01 = 'candy/黄色糖果.png';
        let url_02 = 'candy/红色糖果.png';
        switch (randomNum) {
            case 0:
                candy.name = 'yellowCandy' + this.candyCount;
                (candy.getChildByName('pic') as Laya.Sprite).loadImage(url_01);
                break;
            case 1:
                candy.name = 'redCandy___' + this.candyCount;
                (candy.getChildByName('pic') as Laya.Sprite).loadImage(url_02);
                break;
            default:
                break;
        }
        candy.pos(Laya.stage.width / 2 - candy.width / 2, -100);
        this.candyParent.addChild(candy);
        candy.rotation = 0;
    }

    /**出现敌人*/
    careatEnemy() {
        let enemy = Laya.Pool.getItemByCreateFun('enemy', this.candy.create, this.candy) as Laya.Sprite;
    }

    onUpdate(): void {
        if (this.creatOnOff) {
            let nowTime = Date.now();
            if (nowTime - this.creatTime > this.candy_interval) {
                this.creatTime = nowTime;
                this.productionCandy();
            }
        }
        if (this.enemyAppear) {
            console.log('出现一个敌人');
            this.enemyAppear = false;
        }
    }

    onDisable(): void {

    }
}
import Candy from "./Candy";

export default class MainSceneControl extends Laya.Script {
    /** @prop {name:bucket, tips:"盒子", type:Prefab}*/
    public bucket: Laya.Prefab;
    /** @prop {name:bucketParent, tips:"盒子父节点", type:Node}*/
    public bucketParent: Laya.Sprite;

    /** @prop {name:candy, tips:"糖果", type:Prefab}*/
    public candy: Laya.Prefab;
    /** @prop {name:candyParent, tips:"糖果父节点", type:Node}*/
    public candyParent: Laya.Sprite;

    /** @prop {name:background, tips:"背景图", type:Node}*/
    public background: Laya.Sprite;
    /** @prop {name:assembly, tips:流水线, type:Node}*/
    public assembly: Laya.Sprite;
    /**糖果产生的时间间隔*/
    private candy_interval: number;
    /**当前时间记录*/
    private creatTime: number;
    /**生产开关*/
    private creatOnOff: boolean;
    /**糖果到碰到感应装置时，名字和索引值按顺序装进这个数组*/
    private nameAndIndex: Array<Array<any>>;
    /**生成糖果个数计数器*/
    private candyCount: number;

    constructor() { super(); }

    onEnable(): void {
        this.initSecne();
    }

    /**场景初始化*/
    initSecne(): void {
        this.candy_interval = 500;
        this.creatTime = Date.now();
        this.creatOnOff = true;
        Laya.MouseManager.multiTouchEnabled = true;
        this.nameAndIndex = [];
        this.candyCount = 0;
        this.nameAndIndex = [];
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
        // 给予唯一的索引值
        candy.getComponent(Candy).selfIndex = this.candyCount;
        // 随机创建一种颜色糖果
        let randomNum = Math.floor(Math.random() * 2);
      
        let url_01 = 'candy/黄色糖果.png';
        let url_02 = 'candy/红色糖果.png';
        switch (randomNum) {
            case 0:
                candy.name = 'yellowCandy';
                (candy.getChildByName('pic') as Laya.Sprite).loadImage(url_01);
                break;
            case 1:
                candy.name = 'redCandy';
                (candy.getChildByName('pic') as Laya.Sprite).loadImage(url_02);
                break;
            default:
                break;
        }
        candy.pos(Laya.stage.width / 2 - candy.width / 2, -100);
        this.candyParent.addChild(candy);
        candy.rotation = 0;
    }

    onUpdate(): void {
        if (this.creatOnOff) {
            let nowTime = Date.now();
            if (nowTime - this.creatTime > this.candy_interval) {
                this.creatTime = nowTime;
                this.productionCandy();
            }
        }
    }

    onDisable(): void {

    }
}
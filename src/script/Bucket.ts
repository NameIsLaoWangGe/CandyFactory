import MainSceneControl from "./MainSceneControl";
import Candy from "./Candy";
export default class Bucket extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**糖果到碰到感应装置时，名字和索引值按顺序装进这个数组*/
    private nameAndIndex: Array<Array<any>>;
    /**糖果父节点*/
    private candyParent: Laya.Sprite;

    constructor() { super(); }

    onEnable(): void {
        this.initProperty();
    }
    /**初始化*/
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene as Laya.Scene;
        this.nameAndIndex = this.selfScene.getComponent(MainSceneControl).nameAndIndex;
        this.candyParent = this.selfScene.getComponent(MainSceneControl).candyParent;
        this.bucketClink();
    }
    /**桶点击事件*/
    bucketClink(): void {
        this.self.on(Laya.Event.MOUSE_DOWN, this, this.down);
        this.self.on(Laya.Event.MOUSE_MOVE, this, this.move);
        this.self.on(Laya.Event.MOUSE_UP, this, this.up);
        this.self.on(Laya.Event.MOUSE_OUT, this, this.out);
    }
    /**按下,判断第一个进入感应糖果的颜色;
     * 如果和桶的颜色配对，那么这个糖果会进入相应的桶里面
     * 并且分数增加*/
    down(event): void {
        this.self.scale(0.9, 0.9);
        // 如果感应区有糖果,找到第一个进入感应区的糖果名称和唯一索引值
        if (this.nameAndIndex[0]) {
            // 名称和索引
            let candyName = this.nameAndIndex[this.nameAndIndex.length - 1][0];
            let index = this.nameAndIndex[this.nameAndIndex.length - 1][1];

            for (let i = 0; i < this.candyParent._children.length - 1; i++) {
                let CandyScript = (this.candyParent._children[i] as Laya.Sprite).getComponent(Candy);
                let selfIndex = CandyScript.selfIndex;
                console.log(selfIndex);
                if (selfIndex === index) {
                    // 把目标位置传给他
                    CandyScript.targetBucket = this.self;
                }
            }
            // let presentCandy = this.candyParent.getChildByName(candyName) as Laya.Sprite;
            // let CandyScript = presentCandy.getComponent(Candy);
            // CandyScript.targetBucket = this.self;
            // // 名称配对
            // let pairName = this.self.name + candyName;
            // let matching_01 = 'redBucket' + 'redCandy';
            // let matching_02 = 'yellowBucket' + 'yellowCandy';
            // if (pairName === matching_01 || pairName === matching_02) {
            //     for (let i = 0; i < this.candyParent._children.length - 1; i++) {
            //         let CandyScript = (this.candyParent._children[i] as Laya.Sprite).getComponent(Candy);
            //         let selfIndex = CandyScript.selfIndex;
            //         CandyScript.targetBucket = this.self;
            //         if (selfIndex === index) {
            //             // 把目标位置传给他
            //         } else {

            //         }
            //     }
            // }
        } else {
            console.log('糖果不在感应区，或者点错了');
        }
    }
    /**移动*/
    move(event): void {
    }
    /**抬起*/
    up(): void {
        this.self.scale(1, 1);
    }
    /**出屏幕*/
    out(): void {
        this.self.scale(1, 1);
    }

    onDisable(): void {
    }
}
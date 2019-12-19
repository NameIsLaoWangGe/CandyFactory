import MainSceneControl from "./MainSceneControl";
export default class Candy extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**自己身上的碰撞框*/
    private rig: Laya.RigidBody;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**在父节点上面的索引值*/
    private selfIndex: number;
    /**糖果到碰到感应装置时，名字装进这个数组*/
    private nameAndIndex: Array<string>;
    /**对应桶的目标*/
    private targetBucket: Laya.Sprite;
    /**糖果运行的速度*/
    private speed: number;
    /**是否可以选择目标*/
    private selectTarget: boolean;
    /**得分显示*/
    public scoreLabel: Laya.Label;

    constructor() { super(); }
    onEnable(): void {
        this.initProperty();
    }

    /**初始化*/
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene as Laya.Scene;
        let mainSceneControl = this.selfScene.getComponent(MainSceneControl);
        this.nameAndIndex = mainSceneControl.nameAndIndex;
        this.scoreLabel = mainSceneControl.scoreLabel;
        this.targetBucket = null;
        this.rig = this.self.getComponent(Laya.RigidBody) as Laya.RigidBody;
        this.rig.linearVelocity = { x: 0, y: 0.1 };//此处y值必须不等于0才能正常检测碰撞，并不知道为何
        this.speed = 6;
        this.selectTarget = true;
    }

    onTriggerEnter(other: any, self: any, contact: any): void {
        let otherName: string = other.owner.name;
        // 初次碰撞把名称和唯一的索引值放进数组
        if (otherName === 'induction') {
            let name = self.owner.name;
            this.nameAndIndex.push(name);
        } else if (otherName === 'redBucket' || otherName === 'yellowBucket') {
            this.self.removeSelf();
            let color = self.owner.name.substring(0, 11);
            // 名称配对
            let pairName = color + otherName;
            let matching_01 = 'yellowCandy' + 'yellowBucket';
            let matching_02 = 'redCandy___' + 'redBucket';
            if (pairName === matching_01 || pairName === matching_02) {
                this.scoreLabel.text = (Number(this.scoreLabel.text) + 100).toString();
            } else {
              
            }
        }
    }

    onTriggerStay(other: any, self: any, contact: any): void {
    }

    onTriggerExit(other: any, self: any, contact: any): void {
        let otherName = other.owner.name;
        // 碰撞结束删掉
        if (otherName === 'induction') {
            for (let i = 0; i < this.nameAndIndex.length; i++) {
                if (this.nameAndIndex[i] === self.owner.name) {
                    this.nameAndIndex.splice(i, 1);
                }
            }
        }
    }

    onUpdate(): void {
        // 超出范围消失
        if (this.self.y > Laya.stage.height + 100 || this.self.x > 750 + this.self.width + 50 || this.self.x < -this.self.width) {
            this.self.removeSelf();
        }
        // 判断去向
        if (this.targetBucket === null) {
            this.self.y += this.speed;
        } else {
            // x,y分别相减是两点连线向量
            let point = new Laya.Point(this.targetBucket.x - this.self.x, this.targetBucket.y - this.self.y);
            // 归一化，向量长度为1。
            point.normalize();
            //向量相加
            this.self.x += point.x * this.speed * 15 / 8;
            this.self.y += point.y * this.speed * 15 / 8;
        }
    }
    onDisable(): void {
        Laya.Pool.recover("candy", this.self);
    }
}
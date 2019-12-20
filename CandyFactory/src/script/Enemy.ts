import MainSceneControl from "./MainSceneControl";

export default class Enemy extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**桶的父节点*/
    private bucketParent: Laya.Sprite;
    /**移动速度*/
    private speed: number;
    /**怪物攻击对象,也是上个吃糖果对象*/
    private targetRole: Laya.Sprite;
    private targetPos: Laya.Sprite;

    constructor() { super(); }

    onEnable(): void {
        this.initProperty();
    }

    /**初始化*/
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.owner.scene as Laya.Scene;
        this.targetRole = this.selfScene.getComponent(MainSceneControl);
        this.speed = 6;
    }

    onUpdate(): void {
        // 超出范围消失
        if (this.self.y > Laya.stage.height + 100 || this.self.y < 0 - 100 || this.self.x > 750 + this.self.width + 50 || this.self.x < -this.self.width) {
            this.self.removeSelf();
        }

        // x,y分别相减是两点连线向量
        let point = new Laya.Point(this.targetRole.x - this.self.x, this.targetRole.y - this.self.y);
        // 归一化，向量长度为1。
        point.normalize();
        //向量相加
        this.self.x += point.x * this.speed * 15 / 8;
        this.self.y += point.y * this.speed * 15 / 8;
    }
    onDisable(): void {
    }


}
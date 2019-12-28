import MainSceneControl from "./MainSceneControl";

export default class Bullet extends Laya.Script {
    /**怪物父节点*/
    private enemyParent: Laya.Sprite;
    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**主角父节点*/
    private roleParent: Laya.Sprite;
    /**主角1*/
    private role_01: Laya.Sprite;
    /**主角2*/
    private role_02: Laya.Sprite;

    /**场景脚本*/
    private mainSceneControl;
    /**初始x*/
    private initial_X: number;
    /**初始Y*/
    private initial_Y: number;
    /**子弹速度*/
    private selfSpeed: number;
    /**左右子弹位置*/
    private location: string;
    /**目标，这个目标是最近的那个敌人*/
    private bulletTarget: Laya.Sprite;
    /**攻击力*/
    private attackValue: number;

    /**属性飘字提示*/
    private hintWord: Laya.Prefab;


    constructor() { super(); }

    onEnable(): void {
        this.init();
    }

    /**初始化一些属性*/
    init() {
        this.self = this.owner as Laya.Sprite;
        this.selfScene = this.self.scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);
        this.enemyParent = this.mainSceneControl.enemyParent;
        this.hintWord = this.mainSceneControl.hintWord;
        this.selfSpeed = 15;
        this.attackValue = 0.5;

        // 属性赋值
        this.role_01 = this.selfScene['MainSceneControl'].role_01;
        this.attackValue = this.role_01['Role'].role_property.attackValue;
        this.self['Bullet'] = this;
        // 索敌
        this.lockedBulletTarget();

    }

    /**锁定最近的那个敌人
     * 如果没有敌人，且屏幕上敌人存在，那么会锁定一个敌人
    */
    lockedBulletTarget(): void {
        // 两点之间的距离数组
        let distanceArr: Array<any> = [];
        for (let i = 0; i < this.enemyParent._children.length; i++) {
            let enemy = this.enemyParent._children[i] as Laya.Sprite;
            //两点之间的距离
            let dx: number = enemy.x - this.self.x;
            let dy: number = enemy.y - this.self.y;
            let distance: number = Math.sqrt(dx * dx + dy * dy);
            let object = {
                distance: distance,
                name: enemy.name
            }
            distanceArr.push(object);
        }
        // 距离排序
        var compare = function (obj1, obj2) {
            var val1 = obj1.distance;
            var val2 = obj2.distance;
            if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }
        }
        distanceArr.sort(compare);
        if (distanceArr.length > 0) {
            this.bulletTarget = this.enemyParent.getChildByName(distanceArr[0].name) as Laya.Sprite;
        }
    }

    /**子弹移动
     * 子弹只有当目标对象和目标对象在父节点内的时候才会移动
     * 目标对象永远存在，只不过他被移除了，所以bulletTarget永不为空，只能判断父节点是否存在
     * 那么就会重新选择目标
    */
    bulletMove(): void {
        // this.lockedBulletTarget();
        if (this.bulletTarget && this.bulletTarget.parent) {
            // x,y分别相减是两点连线向量
            let point = new Laya.Point(this.bulletTarget.x - this.self.x, this.bulletTarget.y - this.self.y);
            // 归一化，向量长度为1。
            point.normalize();
            //向量相加
            this.self.x += point.x * this.selfSpeed;
            this.self.y += point.y * this.selfSpeed;
            // 射程为500，超过射程消失
            if (this.self.y <= Laya.stage.width * 1 / 3) {
                this.self.removeSelf();
                return;
            }
        } else {
            this.self.removeSelf();
        }
        // // 消失
        // if (this.enemyParent._children.length === 0) {
        //     this.self.removeSelf();
        // }
    }

    onUpdate(): void {
        // 移动
        this.bulletMove();
        // 超出横向范围消失，一般不会触发
        if (this.self.x > 750 + this.self.width + 50 || this.self.x < -this.self.width) {
            this.self.removeSelf();
        }

        // 碰到任何一个怪物，子弹消失怪物掉血
        // 子弹击中怪物怪物会后退
        // 如果没有到自己的位置，那么算出最近的那个敌人攻击
        for (let i = 0; i < this.enemyParent._children.length; i++) {
            let enemy = this.enemyParent._children[i] as Laya.Sprite;
            let differenceX = Math.abs(enemy.x - this.self.x);
            let differenceY = Math.abs(enemy.y - this.self.y);
            if (differenceX < 30 && differenceY < 30) {

                this.bulletAttackRules(enemy);
                this.self.removeSelf();
            }
        }
    }

    /**子弹对怪物造成伤害的公式
     * 子弹击中怪物，怪物会被击退
      * 攻击力-主角防御如果大于零则造成伤害，否则不造成伤害
      * 并且有动画提示文字
     */
    bulletAttackRules(enemy): void {
        // 掉血显示值，伤害小于零则显示0
        let numberValue: number;
        // 伤害
        let damage = this.attackValue - enemy['Enemy'].enemyProperty.defense;
        if (damage > 0) {
            enemy['Enemy'].enemyProperty.blood -= damage;
            numberValue = damage;
        } else {
            numberValue = 0;
        }
        // 飘字
        this.hintWordMove(enemy, damage);
        // 触发击退
        enemy['Enemy'].repelTimer = 2;
    }

    hintWordMove(enemy: Laya.Sprite, damage: number): void {
        // 敌人被消灭了，则不执行这个
        if (enemy.parent === null) {
            return;
        }
        // 创建提示动画对象
        let hintWord = Laya.Pool.getItemByCreateFun('candy', this.hintWord.create, this.hintWord) as Laya.Sprite;
        hintWord.pos(100, -150);
        enemy.addChild(hintWord);
        let proPertyType: string = '主角掉血';
        let numberValue: number;
        hintWord['HintWord'].initProperty(proPertyType, damage);
    }

    onDisable(): void {
        Laya.Pool.recover('bullet', this.self);
    }
}
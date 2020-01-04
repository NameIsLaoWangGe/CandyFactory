import MainSceneControl from "./MainSceneControl";
import Candy from "./Candy";
import Bullet from "./RoleBullet";
export default class Role extends Laya.Script {
    /** @prop {name:bulletParent, tips:"子弹父节点", type:Node}*/
    public bulletParent: Laya.Sprite;
    /** @prop {name:roleBullet, tips:"子弹", type:Prefab}*/
    public roleBullet: Laya.Prefab;

    /**自己*/
    private self: Laya.Sprite;
    /**所属场景*/
    private selfScene: Laya.Scene;
    /**场景脚本组件*/
    private mainSceneControl;
    /**糖果父节点*/
    private candyParent: Laya.Sprite;
    /**自己的血量*/
    private selfHealth: Laya.ProgressBar;
    /**血量显示文字*/
    private bloodLabel: Laya.Label;
    /**属性展示框*/
    private propertyShow: Laya.Image;

    /**主角属性*/
    private role_property: any;

    /**敌人预警，只要敌人进入射程就会触发警报*/
    private role_Warning: boolean;
    /**两个当前创建时间记录*/
    private nowTime: number;
    /**得分显示*/
    public scoreLabel: Laya.Label;

    constructor() { super(); }

    onEnable(): void {
        this.initProperty();
        this.bucketClink();
        this.rolePropertySet();
    }
    /**初始化*/
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfHealth = this.self.getChildByName('health') as Laya.ProgressBar;
        this.propertyShow = this.self.getChildByName('propertyShow') as Laya.Image;
        // 默认属性不可见
        this.propertyShow.alpha = 0;

        this.bloodLabel = this.selfHealth.getChildByName('bloodLabel') as Laya.Label;
        this.self['Role'] = this;

        this.selfScene = this.self.scene as Laya.Scene;
        this.mainSceneControl = this.selfScene.getComponent(MainSceneControl);//场景脚本组件
        this.candyParent = this.mainSceneControl.candyParent;
        this.scoreLabel = this.mainSceneControl.scoreLabel;
        this.nowTime = Date.now();
    }

    /**主角的属性
     *两个主角属性分别计算
     *四个属性依次是，生命值，子弹攻击力，子弹发射频率和弹道速度，防御能力
    */
    rolePropertySet(): void {
        if (this.self.name === 'role_01') {
            this.role_property = {
                blood: 2000,
                attackValue: 20,
                attackSpeed: 100,
                defense: 15,
            };
        } else if (this.self.name === 'role_02') {
            this.role_property = {
                blood: 2000,
                attackValue: 20,
                attackSpeed: 500,
                defense: 15,
            };
        }
    }

    /**属性实时刷新刷新*/
    updateProperty(): void {
        // 血条上的血量显示、
        this.bloodLabel.text = this.role_property.blood;
        // 属性显示框内的属性显示
        // 血量
        let blood = this.propertyShow.getChildByName('blood') as Laya.Label;
        blood.text = "血量: " + this.role_property.blood;
        // 攻击力
        let attackValue = this.propertyShow.getChildByName('attackValue') as Laya.Label;
        attackValue.text = "攻击力: " + this.role_property.attackValue;
        // 攻击速度
        let attackSpeed = this.propertyShow.getChildByName('attackSpeed') as Laya.Label;
        attackSpeed.text = "攻击速度: " + this.role_property.attackSpeed;
        // 防御力
        let defense = this.propertyShow.getChildByName('defense') as Laya.Label;
        defense.text = "防御力: " + this.role_property.defense;
    }

    /**主角的点击事件
     * 和长按出现属性展示页面
     * 滑动可以拖动主角到规定的位置
    */
    bucketClink(): void {
        this.self.on(Laya.Event.MOUSE_DOWN, this, this.down);
        this.self.on(Laya.Event.MOUSE_MOVE, this, this.move);
        this.self.on(Laya.Event.MOUSE_UP, this, this.up);
        this.self.on(Laya.Event.MOUSE_OUT, this, this.out);
    }
    /**按下,给予目标位置，糖果走向目标位置;
     * 并且分数增加*/
    down(event): void {
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

    /**创建主角子弹
     * 主角1位置的子弹
    */
    careatBullet() {
        let bullet = Laya.Pool.getItemByCreateFun('roleBullet', this.roleBullet.create, this.roleBullet) as Laya.Sprite;
        this.bulletParent.addChild(bullet);
        bullet.pos(this.self.x, this.self.y);
        this.lockedBulletTarget(bullet);
        bullet['Bullet'].belongRole = this.self;
    }

    /**锁定最近的那个敌人
    * 如果没有敌人，且屏幕上敌人存在，那么会锁定一个敌人
    * 左右判断原则是，如果是左边角色发射子弹，那么先观察左边有没有敌人，如果有那么优先攻击左边
   */
    lockedBulletTarget(bullet): void {
        // 两点之间的距离数组
        let distanceArr: Array<any> = [];
        let enemyParent = this.mainSceneControl.enemyParent;
        for (let i = 0; i < enemyParent._children.length; i++) {
            let enemy = enemyParent._children[i] as Laya.Sprite;
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
        // 找出距离最近的
        distanceArr.sort(compare);
        if (distanceArr.length > 0) {
            bullet['Bullet'].bulletTarget = enemyParent.getChildByName(distanceArr[0].name) as Laya.Sprite;
        }
    }

    onUpdate(): void {
        // 血量低于0则死亡
        if (this.role_property.blood <= 0) {
            this.self.removeSelf();
        }
        // 刷新属性
        this.updateProperty();

        //创建子弹
        if (this.role_Warning) {
            let nowTime = Date.now();
            if (nowTime - this.nowTime > this.role_property.attackSpeed) {
                this.careatBullet();
                this.nowTime = nowTime;
            }
        }
    }
    onDisable(): void {

    }
}